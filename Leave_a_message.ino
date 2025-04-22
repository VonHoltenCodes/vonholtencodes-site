#include <Audio.h>
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <RA8875.h>
#include <math.h> // For sin/cos in animation

// ----- Constants and Pin Definitions -----
// RA8875 TFT pins
#define RA8875_CS 5
#define RA8875_RESET 9
#define RA8875_INT 2  // Touch interrupt pin
#define RA8875_MOSI 26
#define RA8875_SCLK 27
#define RA8875_MISO 39

// Custom color definitions
#define RETRO_ORANGE 0xC819    // Medium lilac for main background
#define RETRO_BLACK 0x0000     // Black for text
#define RETRO_WHITE 0xFFFF     // White for borders
#define RETRO_CREAM 0xFFFF     // White for text on dark backgrounds
#define RETRO_DARK_BORDER 0xFFFF  // White for borders
#define RETRO_TEAL 0x001F      // Dark blue for level meter start
#define RETRO_BLUE 0x03EF      // Light blue for level meter end
#define RETRO_MOUNTAIN_DARK 0x4088  // Darker shade for mountains (darker purple)
#define RETRO_MOUNTAIN_LIGHT 0x6109 // Lighter shade for mountains (still darker)
#define RETRO_RED 0xF800       // Red for heart button

// SD card pins
#define SDCARD_CS_PIN 10
#define SDCARD_MOSI_PIN 11
#define SDCARD_SCK_PIN 13

// Level meter coordinates
#define LEVEL_X 50
#define LEVEL_Y 250
#define LEVEL_W 350
#define LEVEL_H 20

// ----- Audio System Configuration -----
AudioInputI2S            i2s1;
AudioAnalyzePeak         peak1;
AudioRecordQueue         queue1;
AudioControlSGTL5000     sgtl5000_1;
AudioConnection          patchCord1(i2s1, 0, peak1, 0);    // Left channel to peak meter
AudioConnection          patchCord2(i2s1, 0, queue1, 0);   // Left channel to recorder

// ----- Global Objects -----
RA8875 tft = RA8875(RA8875_CS, RA8875_RESET, RA8875_MOSI, RA8875_SCLK, RA8875_MISO);
File audioFile;  // For writing WAV files

// ----- State Variables -----
enum ScreenState { IDLE, INSTRUCTIONS, RECORDING };
ScreenState currentScreen = IDLE;

unsigned long lastUpdate = 0;
int messageCount = 1;    // For naming audio files
int totalFiles = 0;      // For displaying total number of messages stored
int folderSession = 1;   // Current message folder session number
String currentFolder;    // Current messages folder path

// ----- Function Prototypes -----
void writeWavHeader(File &file, uint32_t dataLength);
void drawIdleScreen();
void checkTouch();
void startMessageSession();
void waitForStart();
void recordMessage();
void updateAudioLevelMeter();
String formatRecordingTime(long seconds);
void countExistingMessages();
void findAvailableMessageFolder();
String getTimestamp();
void draw8BitMountains();
void draw8BitHeartButton(int x, int y, const char* label);

// ----- Setup and Main Loop -----
void setup() {
  Serial.begin(115200);
  delay(500);
  
  Serial.println("Starting setup");
  
  // Initialize hardware components
  initializeTFT();
  initializeSDCard();
  initializeAudio();
  
  // Count existing message files
  countExistingMessages();
  
  // Initialize timer
  lastUpdate = millis();
  
  // Draw initial screen
  drawIdleScreen();
  Serial.println("Setup complete");
}

void loop() {
  // Check for touch
  checkTouch();
}

// ----- Hardware Initialization Functions -----
void initializeTFT() {
  // Initialize SPI for TFT
  SPI.setMOSI(RA8875_MOSI);
  SPI.setSCK(RA8875_SCLK);
  SPI.setMISO(RA8875_MISO);
  
  // Initialize TFT
  tft.begin(RA8875_800x480);
  tft.displayOn(true);
  tft.GPIOX(true);
  tft.PWMout(RA8875_PWM_CLK_DIV1024, 255);  // Full brightness
  
  // Initialize touch interrupt pin
  pinMode(RA8875_INT, INPUT_PULLUP);
  
  Serial.println("TFT initialized");
}

void initializeSDCard() {
  // Set the SPI pins for SD card
  SPI.setMOSI(SDCARD_MOSI_PIN);
  SPI.setSCK(SDCARD_SCK_PIN);
  
  // Initialize SD card
  if (!SD.begin(SDCARD_CS_PIN)) {
    displayErrorAndHalt("SD Card Error Check Connection");
  } else {
    Serial.println("SD card initialized");
  }
  
  // Find an available session folder
  findAvailableMessageFolder();
}

void initializeAudio() {
  AudioMemory(60);  // Allocate plenty of memory for audio
  
  // Enable the audio shield
  sgtl5000_1.enable();
  sgtl5000_1.inputSelect(AUDIO_INPUT_MIC);  // Select mic input
  sgtl5000_1.micGain(40);                   // Set mic gain
  sgtl5000_1.volume(0.5);                   // Set headphone volume
  
  Serial.println("Audio system initialized");
}

void displayErrorAndHalt(const char* message) {
  tft.fillScreen(RETRO_BLACK);
  tft.setTextColor(RETRO_WHITE);
  tft.setFontScale(1);
  tft.setCursor(20, 200);
  tft.print(message);
  while (true);  // Halt
}

// ----- Screen Drawing Functions -----
void drawIdleScreen() {
  currentScreen = IDLE;
  tft.fillScreen(RETRO_ORANGE);
  
  // Draw 8-bit mountain background
  draw8BitMountains();
  
  // Black borders (5px)
  drawBorders();
  
  // Header with black background
  tft.fillRect(10, 10, 780, 60, RETRO_BLACK);
  
  // First line: "Lisa and Trent"
  tft.setTextColor(RETRO_WHITE);  // White text on black background
  tft.setFontScale(2);
  tft.setCursor(20, 15);
  tft.print("Lisa and Trent");
  
  // Second line: "Estes Park CO 08-01-25" - below header in equal distance
  tft.setCursor(20, 80);
  tft.print("Estes Park CO 08-01-25");
  
  // Display total messages stored and current folder at bottom left
  tft.setTextColor(RETRO_WHITE);
  tft.setFontScale(1);
  tft.setCursor(20, 420);
  tft.print("Session: ");
  tft.print(folderSession);
  tft.print(" | Messages: ");
  tft.print(totalFiles);
  
  // Main button (centered vertically) with thicker black border
  drawMainButton("Leave a Message", 200, 200);
  
  // Heart-shaped Start button at bottom
  draw8BitHeartButton(640, 415, "Start");
}

void drawBorders() {
  tft.drawRect(0, 0, 800, 480, RETRO_WHITE);
  tft.drawRect(5, 5, 790, 470, RETRO_WHITE);
}

void drawMainButton(const char* text, int x, int y) {
  // No white button background - just text with borders
  tft.drawRect(x, y, 400, 100, RETRO_WHITE);
  tft.drawRect(x-1, y-1, 402, 102, RETRO_WHITE);  // Thicker outer border
  tft.drawRect(x-2, y-2, 404, 104, RETRO_WHITE);  // Triple border for prominence
  
  // Original text position - it was perfect before
  tft.setTextColor(RETRO_WHITE);  // White text on background
  tft.setFontScale(2);
  tft.setCursor(x+20, y+30);
  tft.print(text);
}

// Timer functionality removed

// ----- Touch Handling -----
void checkTouch() {
  static unsigned long lastTouchTime = 0;
  
  if (digitalRead(RA8875_INT) == LOW) {  // Touch interrupt detected
    if (millis() - lastTouchTime < 500) return;  // Debounce
    lastTouchTime = millis();
    
    // On idle screen, any touch starts the message session
    if (currentScreen == IDLE) {
      startMessageSession();
      delay(500);  // Prevent double-tap
      Serial.println("Screen tapped - starting message session");
      return;
    }
  }
}

// ----- Message Recording Process -----
void startMessageSession() {
  currentScreen = INSTRUCTIONS;
  tft.fillScreen(RETRO_ORANGE);
  
  // Draw 8-bit mountain background
  draw8BitMountains();
  
  drawBorders();
  
  tft.setTextColor(RETRO_WHITE);
  tft.setFontScale(1);
  
  // Fixed lines with manual line breaks for proper wrapping
  tft.setCursor(20, 100);
  tft.print("Thank you for being here We would love to");
  
  tft.setCursor(20, 130);
  tft.print("hear your voice");
  
  tft.setCursor(20, 170);
  tft.print("Tap below and wait for the countdown to");
  
  tft.setCursor(20, 200);
  tft.print("share your message");
  
  drawMainButton("Start Recording", 200, 300);
  
  // Wait for start button press before proceeding
  waitForStart();
}

void waitForStart() {
  // Clear any pending touch events
  delay(1000);
  
  // Clear any pending touch interrupts
  for (int i = 0; i < 10; i++) {
    digitalRead(RA8875_INT);
    delay(10);
  }
  
  Serial.println("Waiting for Start Recording button press...");
  
  // Simplified touch detection - any touch on the screen starts recording
  while (true) {
    if (digitalRead(RA8875_INT) == LOW) {
      delay(100); // Small debounce
      
      // Wait for touch release
      while (digitalRead(RA8875_INT) == LOW) {
        delay(10);
      }
      
      // Touch detected and released
      Serial.println("Touch detected - starting recording");
      delay(500);  // Additional delay before recording
      break;
    }
    delay(10);  // Small delay to prevent CPU hogging
  }
  
  // Proceed to recording
  Serial.println("Starting recording...");
  recordMessage();
}

// Timer functionality removed

void recordMessage() {
  currentScreen = RECORDING;
  
  // Countdown from 3
  countdownToRecording();
  
  // Clean up screen completely after countdown
  tft.fillScreen(RETRO_ORANGE);
  
  // Draw 8-bit mountain background
  draw8BitMountains();
  
  drawBorders();
  
  // Recording screen - larger text for better visibility
  tft.setTextColor(RETRO_CREAM);
  tft.setFontScale(2);
  tft.setCursor(20, 100);
  tft.print("Recording Say something sweet");
  
  // Stop button - just borders, no white background
  tft.drawRect(200, 300, 400, 100, RETRO_WHITE);
  tft.drawRect(199, 299, 402, 102, RETRO_WHITE);  // Thicker outer border
  tft.drawRect(198, 298, 404, 104, RETRO_WHITE);  // Triple border for prominence
  
  tft.setTextColor(RETRO_WHITE);  // White text for better visibility
  tft.setFontScale(3);  // Larger font for STOP
  // Original position - it was perfect before 
  tft.setCursor(300, 330);
  tft.print("Stop");
  
  // Draw level meter frame
  drawLevelMeterFrame();
  
  // Start recording process
  String fileName = createRecordingFile();
  if (fileName.length() == 0) {
    return;  // Error occurred, returned to idle screen
  }
  
  // Start recording loop
  performRecording(fileName);
  
  // Show thank you message and return to idle
  showThankYouMessage();
}

void countdownToRecording() {
  const int centerX = 400;  // Center of screen
  const int centerY = 240;  // Center of screen
  const int radius = 100;   // Size of clock circle
  const int tickLength = 15; // Length of hour ticks
  const int handLength = 85; // Length of clock hand
  
  for (int countNum = 3; countNum >= 1; countNum--) {
    // Clear the screen and draw borders
    tft.fillScreen(RETRO_ORANGE);
    drawBorders();
    
    // Draw clock circle
    tft.drawCircle(centerX, centerY, radius, RETRO_WHITE);
    
    // Draw hour ticks
    for (int hour = 0; hour < 12; hour++) {
      float angle = hour * 30 * PI / 180; // Convert to radians (30 degrees per hour)
      int outerX = centerX + (radius) * sin(angle);
      int outerY = centerY - (radius) * cos(angle);
      int innerX = centerX + (radius - tickLength) * sin(angle);
      int innerY = centerY - (radius - tickLength) * cos(angle);
      tft.drawLine(innerX, innerY, outerX, outerY, RETRO_WHITE);
    }
    
    // Draw special mark at 12 o'clock
    tft.fillCircle(centerX, centerY - radius, 5, RETRO_WHITE);
    
    // Draw countdown number in center
    tft.setTextColor(RETRO_WHITE);
    tft.setFontScale(4);  // Larger font for countdown
    
    // Calculate position to center the text
    int textWidth = 20;  // Approximate width of one digit at fontScale 4
    tft.setCursor(centerX - textWidth/2, centerY - 20);
    tft.print(countNum);
    
    // Animate sweeping hand for 12 positions
    for (int hour = 0; hour < 12; hour++) {
      float angle = hour * 30 * PI / 180; // Convert to radians (30 degrees per hour)
      int handX = centerX + handLength * sin(angle);
      int handY = centerY - handLength * cos(angle);
      
      // Draw clock hand
      tft.drawLine(centerX, centerY, handX, handY, RETRO_CREAM);
      delay(70);  // Pause briefly at each hour position
      
      // Erase clock hand (if not the last position)
      if (hour < 11) {
        tft.drawLine(centerX, centerY, handX, handY, RETRO_ORANGE);
      }
    }
    
    // Short pause at the end of each second
    delay(100);
  }
}

void drawLevelMeterFrame() {
  tft.drawRect(LEVEL_X - 1, LEVEL_Y - 1, LEVEL_W + 2, LEVEL_H + 2, RETRO_WHITE);
  // Move "Audio Level" text to right side of screen, under header
  tft.setCursor(600, 70);
  tft.setFontScale(1);
  tft.setTextColor(RETRO_WHITE);
  tft.print("Audio Level");
}

String createRecordingFile() {
  Serial.println("Creating WAV file");
  // Use timestamp in filename for better record-keeping
  String timestamp = getTimestamp();
  String fileName = currentFolder + "/msg_" + timestamp + "_" + String(messageCount++) + ".wav";
  audioFile = SD.open(fileName.c_str(), FILE_WRITE);
  
  if (!audioFile) {
    Serial.println("Failed to create WAV file!");
    tft.fillScreen(RETRO_BLACK);
    tft.setTextColor(RETRO_WHITE);
    tft.setFontScale(1);
    tft.setCursor(20, 200);
    tft.print("Failed to create WAV file");
    delay(3000);  // Show error for 3 seconds
    drawIdleScreen();  // Return to idle screen
    return "";
  }
  
  // Write WAV header placeholder (will be updated later)
  uint8_t header[44] = {0};
  audioFile.write(header, 44);
  
  return fileName;
}

void performRecording(String fileName) {
  // Clear the audio buffer before starting
  queue1.clear();
  
  // Start capturing audio
  queue1.begin();
  Serial.println("Recording started");
  
  uint32_t dataLength = 0;
  unsigned long startTime = millis();
  unsigned long lastDebounceTime = 0;
  unsigned long lastLevelUpdate = 0;
  bool stopped = false;
  
  // Clear any pending interrupts
  digitalRead(RA8875_INT);
  
  // Record for up to 60 seconds or until stopped
  while (millis() - startTime < 60000 && !stopped) {
    // Update timer - show recording time
    displayRecordingTimer(startTime);
    
    // Update audio level every 50ms
    if (millis() - lastLevelUpdate > 50) {
      updateAudioLevelMeter();
      lastLevelUpdate = millis();
    }
    
    // Process all available audio buffers
    dataLength = processAudioBuffers(dataLength);
    
    // Check for any touch to stop recording
    if (digitalRead(RA8875_INT) == LOW) {
      // Simple debounce
      if (millis() - lastDebounceTime > 500) {
        lastDebounceTime = millis();
        Serial.println("Touch detected on recording screen - stopping");
        stopped = true;
        
        // Wait for release and clear interrupt
        delay(300);
        while (digitalRead(RA8875_INT) == LOW) {
          delay(10);  // Wait for release
        }
      }
    }
    
    // Small delay to prevent CPU hogging
    delay(10);
  }
  
  // Stop recording and finalize WAV file
  finalizeRecording(dataLength);
}

void displayRecordingTimer(unsigned long startTime) {
  tft.fillRect(20, 180, 200, 40, RETRO_ORANGE);
  tft.setCursor(20, 180);
  tft.setFontScale(2);
  tft.print(formatRecordingTime((millis() - startTime) / 1000) + " / 1:00");
}

uint32_t processAudioBuffers(uint32_t dataLength) {
  while (queue1.available() > 0) {
    uint8_t* buffer = (uint8_t*)queue1.readBuffer();
    audioFile.write(buffer, 256);  // Use 256 bytes for better timing
    dataLength += 256;
    queue1.freeBuffer();
  }
  return dataLength;
}

void finalizeRecording(uint32_t dataLength) {
  // Stop recording
  queue1.end();
  Serial.println("Recording stopped");
  
  // Make sure to flush any remaining buffers
  while (queue1.available() > 0) {
    uint8_t* buffer = (uint8_t*)queue1.readBuffer();
    audioFile.write(buffer, 256);
    dataLength += 256;
    queue1.freeBuffer();
  }
  
  // Update WAV header with final size
  Serial.print("Writing WAV header, data length: ");
  Serial.println(dataLength);
  writeWavHeader(audioFile, dataLength);
  audioFile.close();
}

void showThankYouMessage() {
  tft.fillScreen(RETRO_ORANGE);
  
  // Draw 8-bit mountain background
  draw8BitMountains();
  
  drawBorders();
  
  tft.setTextColor(RETRO_WHITE);
  tft.setFontScale(2);
  tft.setCursor(20, 200);
  tft.print("Message saved thank you");
  
  // Draw a heart to show appreciation
  draw8BitHeartButton(400, 300, "");
  
  // Wait during thank you message
  unsigned long thankYouStart = millis();
  while (millis() - thankYouStart < 3000) {
    delay(50);
  }
  
  // Return to idle screen
  currentScreen = IDLE;
  
  // Update total files count
  countExistingMessages();
  
  // Clear any pending touch events
  digitalRead(RA8875_INT);
  delay(500);
  
  drawIdleScreen();
}

// ----- Audio Level Meter -----
void updateAudioLevelMeter() {
  if (peak1.available()) {
    float level = peak1.read();
    int width = level * LEVEL_W;
    
    // Draw level meter with gradient effect
    if (width > 0) {
      // First part (0-60%) uses dark blue (reversed colors)
      int blueWidth = min(width, (int)(LEVEL_W * 0.6));
      if (blueWidth > 0) {
        tft.fillRect(LEVEL_X, LEVEL_Y, blueWidth, LEVEL_H, RETRO_TEAL);
      }
      
      // Second part (60-100%) uses light blue for higher levels
      if (width > blueWidth) {
        tft.fillRect(LEVEL_X + blueWidth, LEVEL_Y, width - blueWidth, LEVEL_H, RETRO_BLUE);
      }
    }
    
    // Clear unused portion
    if (width < LEVEL_W) {
      tft.fillRect(LEVEL_X + width, LEVEL_Y, LEVEL_W - width, LEVEL_H, RETRO_BLACK);
    }
    
    // Print level value - small and to the right
    tft.fillRect(LEVEL_X + LEVEL_W + 10, LEVEL_Y, 60, LEVEL_H, RETRO_ORANGE);
    tft.setCursor(LEVEL_X + LEVEL_W + 10, LEVEL_Y + 5);
    tft.setTextColor(RETRO_WHITE);
    tft.setFontScale(1);
    tft.print(level, 2);
  }
}

// ----- WAV File Handling -----
void writeWavHeader(File &file, uint32_t dataLength) {
  file.seek(0);
  uint32_t sampleRate = 44100;
  uint16_t bitsPerSample = 16;
  uint16_t channels = 1;
  uint32_t totalLength = dataLength + 36; // Header is 44 bytes, so data length + 36
  
  // Write WAV header
  file.write("RIFF", 4);
  file.write((uint8_t*)&totalLength, 4);  // Total file size - 8
  file.write("WAVE", 4);
  file.write("fmt ", 4);
  uint32_t fmtLength = 16;
  file.write((uint8_t*)&fmtLength, 4);
  uint16_t format = 1;  // PCM
  file.write((uint8_t*)&format, 2);
  file.write((uint8_t*)&channels, 2);
  file.write((uint8_t*)&sampleRate, 4);
  uint32_t byteRate = sampleRate * channels * bitsPerSample / 8;
  file.write((uint8_t*)&byteRate, 4);
  uint16_t blockAlign = channels * bitsPerSample / 8;
  file.write((uint8_t*)&blockAlign, 2);
  file.write((uint8_t*)&bitsPerSample, 2);
  file.write("data", 4);
  file.write((uint8_t*)&dataLength, 4);  // Data chunk size
}

// Count number of message files stored in the current folder
void countExistingMessages() {
  File messagesDir = SD.open(currentFolder.c_str());
  if (!messagesDir) {
    Serial.print("Failed to open ");
    Serial.println(currentFolder);
    totalFiles = 0;
    return;
  }
  
  totalFiles = 0;
  while (true) {
    File entry = messagesDir.openNextFile();
    if (!entry) {
      break; // No more files
    }
    
    // Check if it's a WAV file by examining extension
    String filename = entry.name();
    if (filename.endsWith(".wav") || filename.endsWith(".WAV")) {
      totalFiles++;
    }
    
    entry.close();
  }
  
  messagesDir.close();
  Serial.print("Found ");
  Serial.print(totalFiles);
  Serial.print(" message files in ");
  Serial.println(currentFolder);
}

// Find a viable message folder for this session
void findAvailableMessageFolder() {
  folderSession = 1;
  
  // Try to find an available folder
  while (true) {
    if (folderSession == 1) {
      currentFolder = "/messages";
    } else {
      currentFolder = "/messages" + String(folderSession);
    }
    
    // Check if this folder exists
    if (!SD.exists(currentFolder.c_str())) {
      // Found a new folder name we can use
      SD.mkdir(currentFolder.c_str());
      Serial.print("Created new folder: ");
      Serial.println(currentFolder);
      break;
    }
    
    // Check if the folder exists but is empty or has few files
    // If it has files, we'll create a new folder
    File dir = SD.open(currentFolder.c_str());
    if (!dir) {
      // Can't open directory, try next number
      folderSession++;
      continue;
    }
    
    // Check if folder is empty or has very few files
    bool isEmpty = true;
    int fileCount = 0;
    while (true) {
      File entry = dir.openNextFile();
      if (!entry) {
        break;
      }
      
      // Count WAV files
      String name = entry.name();
      if (name.endsWith(".wav") || name.endsWith(".WAV")) {
        fileCount++;
        if (fileCount > 2) { // Allow a few files before considering it "used"
          isEmpty = false;
          break;
        }
      }
      entry.close();
    }
    
    dir.close();
    
    if (isEmpty) {
      // This folder exists but is empty or has few files, we can use it
      Serial.print("Using existing folder with few files: ");
      Serial.println(currentFolder);
      break;
    }
    
    // Try next folder number
    folderSession++;
  }
  
  // Reset message counter for new folder
  messageCount = 1;
}

// Generate a timestamp string in format MMDD_HHMM
String getTimestamp() {
  // For a real timestamp, you'd use an RTC module
  // For now, we'll use the millis() as a simple substitute
  unsigned long ms = millis();
  
  // Create a pseudo-timestamp using millis (not real time but unique)
  int pseudoHour = (ms / 3600000) % 24;
  int pseudoMin = (ms / 60000) % 60;
  int pseudoSec = (ms / 1000) % 60;
  
  char buffer[12];
  sprintf(buffer, "%02d%02d_%02d%02d", 
          pseudoHour % 12 + 1, pseudoMin % 30 + 1, 
          pseudoSec, (ms / 10) % 100);
  
  return String(buffer);
}

// ----- Utility Functions -----
String formatRecordingTime(long seconds) {
  int minutes = seconds / 60;
  int secs = seconds % 60;
  
  char buffer[10];
  sprintf(buffer, "%d:%02d", minutes, secs);
  return String(buffer);
}

// Draw 8-bit style mountains in the background
void draw8BitMountains() {
  // Mountain range parameters
  const int baseY = 380;  // Bottom of mountains
  
  // Create an array of mountain peaks - [x, height] pairs
  // These create a mountain range with varying heights
  int peaks[][2] = {
    {0, 80},     // Start off-screen
    {100, 180},  // First peak
    {200, 120},  // Valley
    {300, 220},  // Second peak (tallest)
    {400, 100},  // Valley
    {500, 150},  // Third peak
    {600, 80},   // Small hill
    {700, 120},  // Last visible peak
    {800, 70}    // End off-screen
  };
  
  // Draw the mountain range as a filled polygon
  // using 8-bit style (jagged, pixelated edges)
  
  // First draw the dark mountain base
  for (int i = 0; i < 8; i++) {
    // Draw a jagged, filled trapezoid between each pair of peaks
    int startX = peaks[i][0];
    int endX = peaks[i+1][0];
    int startHeight = peaks[i][1];
    int endHeight = peaks[i+1][1];
    
    // Draw with pixelated, jagged edges
    for (int x = startX; x < endX; x += 8) {  // 8-pixel steps for jagged look
      // Calculate height at this x position (linear interpolation)
      int progress = x - startX;
      int totalDist = endX - startX;
      int height;
      
      // Add some randomness for jagged effect
      if (progress % 16 < 8) {
        height = startHeight + (endHeight - startHeight) * progress / totalDist;
      } else {
        height = startHeight + (endHeight - startHeight) * progress / totalDist - 8;
      }
      
      // Draw vertical line
      tft.fillRect(x, baseY - height, 8, height, RETRO_MOUNTAIN_DARK);
    }
  }
  
  // Now draw a lighter, smaller mountain range in front
  for (int i = 1; i < 7; i++) {  // Smaller range
    int startX = peaks[i][0] + 50;  // Offset
    int endX = peaks[i+1][0] + 30;
    int startHeight = peaks[i][1] * 0.6;  // 60% of height
    int endHeight = peaks[i+1][1] * 0.6;
    
    for (int x = startX; x < endX; x += 6) {  // 6-pixel steps for jagged look
      int progress = x - startX;
      int totalDist = endX - startX;
      int height;
      
      // Add some randomness for jagged effect
      if (progress % 12 < 6) {
        height = startHeight + (endHeight - startHeight) * progress / totalDist;
      } else {
        height = startHeight + (endHeight - startHeight) * progress / totalDist - 6;
      }
      
      // Draw vertical line
      tft.fillRect(x, baseY - height, 6, height, RETRO_MOUNTAIN_LIGHT);
    }
  }
}

// Draw an 8-bit style heart button
void draw8BitHeartButton(int x, int y, const char* label) {
  // Heart dimensions
  const int heartWidth = 40;
  const int heartHeight = 40;
  
  // Calculate button center
  int centerX = x;
  int centerY = y;
  
  // Define heart shape using 8x8 pixel blocks
  // This creates a blocky 8-bit style heart with completely blank top row
  
  // Row 2 - top arcs of the heart (no pixels in row 1)
  tft.fillRect(centerX - 24, centerY - 8, 8, 8, RETRO_RED);  // Left arc outer
  tft.fillRect(centerX - 16, centerY - 8, 8, 8, RETRO_RED);  // Left arc inner
  tft.fillRect(centerX + 8, centerY - 8, 8, 8, RETRO_RED);   // Right arc outer
  tft.fillRect(centerX, centerY - 8, 8, 8, RETRO_RED);       // Right arc inner
  
  // Row 3 - middle row of heart (full width)
  tft.fillRect(centerX - 24, centerY, 8, 8, RETRO_RED);
  tft.fillRect(centerX - 16, centerY, 8, 8, RETRO_RED);
  tft.fillRect(centerX - 8, centerY, 8, 8, RETRO_RED);
  tft.fillRect(centerX, centerY, 8, 8, RETRO_RED);
  tft.fillRect(centerX + 8, centerY, 8, 8, RETRO_RED);
  
  // Row 4 - narrowing toward point
  tft.fillRect(centerX - 16, centerY + 8, 8, 8, RETRO_RED);
  tft.fillRect(centerX - 8, centerY + 8, 8, 8, RETRO_RED);
  tft.fillRect(centerX, centerY + 8, 8, 8, RETRO_RED);
  
  // Row 5 - bottom point
  tft.fillRect(centerX - 8, centerY + 16, 8, 8, RETRO_RED);
  
  // Add white border around heart for visibility
  // Row 2 borders
  tft.drawRect(centerX - 24, centerY - 8, 8, 8, RETRO_WHITE);
  tft.drawRect(centerX - 16, centerY - 8, 8, 8, RETRO_WHITE);
  tft.drawRect(centerX + 8, centerY - 8, 8, 8, RETRO_WHITE);
  tft.drawRect(centerX, centerY - 8, 8, 8, RETRO_WHITE);
  
  // Row 3 borders
  tft.drawRect(centerX - 24, centerY, 8, 8, RETRO_WHITE);
  tft.drawRect(centerX - 16, centerY, 8, 8, RETRO_WHITE);
  tft.drawRect(centerX - 8, centerY, 8, 8, RETRO_WHITE);
  tft.drawRect(centerX, centerY, 8, 8, RETRO_WHITE);
  tft.drawRect(centerX + 8, centerY, 8, 8, RETRO_WHITE);
  
  // Row 4 borders
  tft.drawRect(centerX - 16, centerY + 8, 8, 8, RETRO_WHITE);
  tft.drawRect(centerX - 8, centerY + 8, 8, 8, RETRO_WHITE);
  tft.drawRect(centerX, centerY + 8, 8, 8, RETRO_WHITE);
  
  // Row 5 border
  tft.drawRect(centerX - 8, centerY + 16, 8, 8, RETRO_WHITE);
  
  // Add the label
  tft.setTextColor(RETRO_WHITE);
  tft.setFontScale(1);
  tft.setCursor(centerX - 20, centerY + 26);  // Position below heart
  tft.print(label);
}