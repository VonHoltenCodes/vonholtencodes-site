/*
  Project System for Teensy 4.1 Example

  This program checks for presence of PSRAM/Flash memory, the Audio adapter
  with SD card and the ESP32.  Sends the results to the LCD and serial port and
  then draws 3 buttons on the LCD screen - Audio, WiFi Scan abd I/O Scan

  If Audio adapter is attached with an SD card installed, the Audio
  button plays the wave file "SDTEST2.WAV" from the Teensy audio tutorial
  https://www.pjrc.com/teensy/td_libs_AudioDataFiles.html
  It also displays a peak meter for the left/ right audio channels on the 
  right side of the display.

  The WiFi Scan button sends a command to the ESP32S requesting a scan of
  available WiFi networks.  When the ESP32S returns the scan results,
  the Teensy 4.1 updates those results on the LCD screen and serial port.
  This requires an ESP32S to be installed and the sample program
  ESP32_Teensy_41_Demo be loaded on it, which is just a modified version
  of the ESP32 WiFiScan example program.

  To work with the Capacitive touch, edit RS8875UserSettings.h to enable touch.  
  Comment out resistive touch and uncomment capacitive touch as shown here
    //#define USE_RA8875_TOUCH//resistive touch screen
    #define USE_FT5206_TOUCH//capacitive touch screen

  File may be found at this location on Windows or do a search for it on the harddrive: 
  "C:\Program Files(x86)\Arduino\hardware\teensy\avr\libraries\RA8875\_settings\RA8875UserSettings.h"

  Download https://github.com/stechio/arduino-ad-mux-lib for working with the analog/digital
  multiplexers

  Download https://github.com/adafruit/Adafruit-MCP23017-Arduino-Library for working
 with the  MCP23017 I/O Expander

  Download https://github.com/mjs513/ILI9341_fonts and unzip into Arduino/Library folder
  to use fonts other than the standard that come with this LCD which are not very good.

  This example code is in the public domain.
*/

#include <Audio.h>
#include <Wire.h>
#include <SPI.h>
#include <SerialFlash.h>
#include <RA8875.h>
#include <SD.h>
#include <LittleFS.h>
#include <Mux.h>
#include <Adafruit_MCP23X17.h>
#include <font_Arial.h>
#include <TimeLib.h>
extern "C" uint8_t external_psram_size;

using namespace admux;
Adafruit_MCP23X17 mcp;

// This section comes from the Teensy Audio Design Tool
AudioPlaySdWav playSdWav1;
AudioAnalyzePeak peak2;
AudioAnalyzePeak peak1;
AudioOutputI2S i2s1;
AudioConnection patchCord1(playSdWav1, 0, i2s1, 0);
AudioConnection patchCord2(playSdWav1, 0, peak1, 0);
AudioConnection patchCord3(playSdWav1, 1, i2s1, 1);
AudioConnection patchCord4(playSdWav1, 1, peak2, 0);
AudioControlSGTL5000 sgtl5000_1;

// Pins used with the Teensy Audio Shield
const int SDCARD_CS_PIN = 10;
const int SDCARD_MOSI_PIN = 11;
const int SDCARD_SCK_PIN = 13;

// Pins used for LCD and touch.  Using SPI1 bus
const int RA8875_MISO = 39;
const int RA8875_MOSI = 26;
const int RA8875_SCLK = 27;
const int RA8875_CS = 5;
const int RA8875_RESET = 9;
const int RA8875_INT = 2;

// Setup LCD to use SPI1
RA8875 tft = RA8875(RA8875_CS, RA8875_RESET, RA8875_MOSI, RA8875_SCLK, RA8875_MISO);

const int MAXTOUCHLIMIT = 1;  // (1 to 5) number of simultaneous touches allowed
const int DARKGRAY = 0x29A7;
const int TOUCH_CHECK_INTERVAL = 20;  //msec

// Define Audio button location and size
const int AUDIO_X = 10;
const int AUDIO_Y = 10;
const int AUDIO_W = 125;
const int AUDIO_H = 32;

// Define Scan button location and size
const int SCAN_X = 10;
const int SCAN_Y = 60;
const int SCAN_W = 125;
const int SCAN_H = 32;

// Define I/O Expansion button location and size
const int IO_X = 175;
const int IO_Y = 10;
const int IO_W = 125;
const int IO_H = 32;

// Define Clock button location and size
const int CLOCK_X = 320;
const int CLOCK_Y = 10;
const int CLOCK_W = 125;
const int CLOCK_H = 32;

// Define Left Audio Channel location and size
const int LEFT_X = 620;
const int LEFT_Y = 380;
const int LEFT_W = 40;
const int LEFT_H = 360;

// Define Right Audio Channel location and size
const int RIGHT_X = 720;
const int RIGHT_Y = 380;
const int RIGHT_W = 40;
const int RIGHT_H = 360;

#define ESP32SERIAL Serial7  // ESP32 is attached to Serial7 port

uint16_t coordinates[MAXTOUCHLIMIT][2];  //to hold touch coordinates
uint16_t lastpX = 0;
uint16_t lastpY = 0;
const uint16_t maxRadius = 5;
bool touchReported = false;
bool releaseReported = false;
elapsedMillis touchTimer = 0;

// Subroutine prototypes
void SetWiFiScanButton(boolean);  // Handles Scan button when touched
void SetAudioButton(boolean);     // Handles Audio button when touched
void SetIOScanButton(boolean);    // Handles I/O button when touched
void SetClockButton(boolean);     // Handles Clock button when touched
void UpdateAudioLevels();         // Updates audio level meter
void UpdateClock();               // Updates the world clock display
void ConnectWiFi();               // Connect to WiFi network
void SyncTimeNTP();               // Sync time from NTP server

// Creates two 8-channel Mux instances with same address pins.
Mux mux1(Pinset(3, 4, 6));
Mux mux2(Pinset(3, 4, 6));

// Misc flags to keep track of things
boolean WiFi_ScanRequested = false;    // Flag if WiFi scan is in process
boolean IO_ScanRequested = false;      // Flag if I/O scan is in process
boolean audioAdapterAttached = false;  // Flag if audio bd with SD card attached
boolean audioPlaying = false;          // Flag if audio is currently playing
boolean audioUpdatePause = false;      // Flag to temporarily pause audio
boolean esp32SAttached = false;        // Flag if ESP32S is attached
boolean clockActive = false;           // Flag if world clock is displayed
boolean timeSet = false;               // Flag if time has been set from NTP

// WiFi credentials
const char* wifi_ssid = "308greenfiele";
const char* wifi_password = "Lisa@308";

// Time zone offsets in hours
const int NUM_TIMEZONES = 4;
const char* timezone_names[NUM_TIMEZONES] = {"Local", "London", "Tokyo", "Sydney"};
const int timezone_offsets[NUM_TIMEZONES] = {-5, 0, 9, 10};  // EDT, GMT, JST, AEST

// Setup timer for audio levels graph updates.
elapsedMillis msecs;
// Setup timer for clock updates
elapsedMillis clockTimer;
//===============================================================================
//  Initialization
//===============================================================================
void setup() {
  Serial.begin(115200);       //Initialize USB serial port to computer
  ESP32SERIAL.begin(115200);  //Initialize Seria17 connected to ESP32S Serial2

  // Setup LCD screen
  tft.begin(RA8875_800x480);
  tft.setRotation(2);   // Rotates both screen and touchscreen
  tft.brightness(255);  // Set brightness to max (default)
#if defined(USE_FT5206_TOUCH)
  tft.useCapINT(RA8875_INT);         //We use the capacitive chip Interrupt out
  tft.setTouchLimit(MAXTOUCHLIMIT);  // Set max touches we will recognize
  tft.enableCapISR(true);            //Arm capacitive touch screen interrupt
#else                                // First time use - edit this file to enable touch
  tft.print("you should open RA8875UserSettings.h file and uncomment USE_FT5206_TOUCH!");
#endif
  tft.fillWindow(RA8875_BLUE);     // Fill window blue
  tft.setTextColor(RA8875_WHITE);  // White text, transparent background
  tft.setCursor(1, 110);           // Set initial cursor position
  //tft.setFontScale(0);           // If using the built-in fonts
  tft.setFont(Arial_14);  // If using custom fonts like we are here

  // Check for PSRAM chip(s) installed
  uint8_t size = external_psram_size;
  if (size == 0) {
    Serial.println("No PSRAM Installed");
    tft.println("No PSRAM Installed");
  } else {
    Serial.printf("PSRAM Memory Size = %d Mbyte\n", size);
    tft.printf("PSRAM Memory Size = %d Mbyte\n", size);
    tft.println();
  }

  LittleFS_QSPIFlash myfs_NOR;  // NOR FLASH
  LittleFS_QPINAND myfs_NAND;   // NAND FLASH

  // Check for NOR Flash chip installed
  if (myfs_NOR.begin()) {
    Serial.printf("NOR Flash Memory Size = %d Mbyte / ", myfs_NOR.totalSize() / 1048576);
    Serial.printf("%d Mbit\n", myfs_NOR.totalSize() / 131072);
    tft.printf("NOR Flash Memory Size = %d Mbyte / ", myfs_NOR.totalSize() / 1048576);
    tft.printf("%d Mbit\n", myfs_NOR.totalSize() / 131072);
  }
  // Check for NAND Flash chip installed
  else if (myfs_NAND.begin()) {
    Serial.printf("NAND Flash Memory Size =  %d bytes / ", myfs_NAND.totalSize());
    Serial.printf("%d Mbyte / ", myfs_NAND.totalSize() / 1048576);
    Serial.printf("%d Gbit\n", myfs_NAND.totalSize() * 8 / 1000000000);
    tft.println("NAND Flash Memory Size = ");
    tft.printf("%d bytes / ", myfs_NAND.totalSize());
    tft.printf("%d Mbyte / ", myfs_NAND.totalSize() / 1048576);
    tft.printf("%d Gbit\n", myfs_NAND.totalSize() * 8 / 1000000000);
  } else {
    Serial.printf("No Flash Installed\n");
    tft.printf("No Flash Installed\n");
  }
  tft.println();

  // Check for Audio bd with SD card installed
  if (!(SD.begin(SDCARD_CS_PIN))) {
    Serial.println("Audio board with SD card not found");
    tft.println("Audio board with SD card not found");
    audioAdapterAttached = false;
  } else {
    Serial.println("Audio board with SD card is attached");
    tft.println("Audio board with SD card is attached");
    audioAdapterAttached = true;
  }

  // Check for ESP32 installed
  ESP32SERIAL.print("?");         // Ask ESP32 if it is there
  delay(100);                     // Wait a bit for ESP32 to respond
  if (ESP32SERIAL.available()) {  // If there is a response
    String returnData = ESP32SERIAL.readString();
    if (returnData.indexOf("Y") >= 0) {  // ESP32S responded with Y for Yes, I'm here
      esp32SAttached = true;
      Serial.println("ESP32S was found");
      tft.println("ESP32S was found");
    } else {  // Invalid response
      Serial.println("ESP32S invalid response");
      tft.println("ESP32S invalid response");
      esp32SAttached = false;
    }
  } else {  // ESP32S did not respond
    Serial.println("ESP32S not found");
    tft.println("ESP32S not found");
    esp32SAttached = false;
  }

  // Draw initial buttons
  SetAudioButton(false);
  SetWiFiScanButton(false);
  SetIOScanButton(false);
  SetClockButton(false);

  // Setup audio
  if (audioAdapterAttached) {  // Setup the audio if found
    AudioMemory(8);
    sgtl5000_1.enable();
    sgtl5000_1.volume(0.5);
    SPI.setMOSI(SDCARD_MOSI_PIN);
    SPI.setSCK(SDCARD_SCK_PIN);
    tft.drawRect(600, 10, 180, 440, RA8875_YELLOW);
    tft.setTextColor(RA8875_GREEN);
    tft.setCursor(635, 460);
    tft.print("Audio Levels");
    tft.setCursor(LEFT_X, LEFT_Y + 50);
    tft.print("L Ch");
    tft.setCursor(RIGHT_X, RIGHT_Y + 50);
    tft.print("R Ch");
    tft.setTextColor(RA8875_WHITE);
  } else {  // If no audio, gray out button
    tft.setCursor(AUDIO_X + 8, AUDIO_Y + 8);
    tft.setTextColor(RA8875_WHITE);
    tft.fillRoundRect(AUDIO_X, AUDIO_Y, AUDIO_W, AUDIO_H, 4, DARKGRAY);
    tft.print("No Audio");
  }

  // Setup ESP32
  if (!esp32SAttached) {  // If no ESP32 gray out buttons
    tft.setCursor(SCAN_X + 8, SCAN_Y + 8);
    tft.setTextColor(RA8875_WHITE);
    tft.fillRoundRect(SCAN_X, SCAN_Y, SCAN_W, SCAN_H, 4, DARKGRAY);
    tft.print("No Scan");
    
    tft.setCursor(CLOCK_X + 8, CLOCK_Y + 8);
    tft.setTextColor(RA8875_WHITE);
    tft.fillRoundRect(CLOCK_X, CLOCK_Y, CLOCK_W, CLOCK_H, 4, DARKGRAY);
    tft.print("No Clock");
  }

  // Setup I/O Scan
  tft.setCursor(IO_X + 8, IO_Y + 8);
  tft.setTextColor(RA8875_WHITE);
  tft.fillRoundRect(IO_X, IO_Y, IO_W, IO_H, 4, RA8875_RED);
  tft.print("I/O Scan");
  
  // Setup World Clock
  tft.setCursor(CLOCK_X + 8, CLOCK_Y + 8);
  tft.setTextColor(RA8875_WHITE);
  tft.fillRoundRect(CLOCK_X, CLOCK_Y, CLOCK_W, CLOCK_H, 4, RA8875_RED);
  tft.print("World Clock");
  // Setup for either digital or analog input
  //mux1.signalPin(24, INPUT, PinType::Digital);
  mux1.signalPin(25, INPUT, PinType::Analog);
  mux2.signalPin(24, INPUT, PinType::Analog);
  // Intialize MCP23017 and configure all pins as inputs
  if (!mcp.begin_I2C(0x24, &Wire1)) Serial.println("MCP23017 Error.");
  for (int i = 0; i < 16; i++) {
    mcp.pinMode(i, INPUT_PULLUP);
  }
}
//===============================================================================
//  Main
//===============================================================================
void loop() {
  // Keep an eye on any audio that may be playing and reset button when it ends
  if (playSdWav1.isStopped() && audioPlaying) {  // Audio finished playing
    SetAudioButton(false);
    Serial.println("Audio finished playing");
  }
  if (tft.touched()) {                  // Check for LCD touch
    tft.updateTS();                     // update data inside library
    tft.getTScoordinates(coordinates);  // Get touch coordinates in pixels
    uint16_t pX = coordinates[0][0];
    uint16_t pY = coordinates[0][1];
    tft.setTextColor(RA8875_WHITE, RA8875_BLUE);
    tft.setCursor(CENTER, CENTER);  // print touch coordinates in center of screen
    tft.print(pX);
    tft.print(" / ");
    tft.print(pY);
    tft.print("                  ");  // Erase any extra left over characters
    // Ignore if touching same spot
    if ((pX != lastpX) || (pY != lastpY)) {
      lastpX = pX;
      lastpY = pY;
      // Look for an Audio Button Hit
      if ((pX >= AUDIO_X) && (pX <= (AUDIO_X + AUDIO_W))) {
        if ((pY >= AUDIO_Y) && (pY <= (AUDIO_Y + AUDIO_H))) {
          Serial.println("Audio Button Hit");
          if (audioAdapterAttached && !audioPlaying) {
            SetAudioButton(true);
          } else if (audioAdapterAttached && audioPlaying) {
            SetAudioButton(false);
          }
        }
      }
      // Look for a WiFi Scan Button Hit
      if ((pX >= SCAN_X) && (pX <= (SCAN_X + SCAN_W))) {
        if ((pY >= SCAN_Y) && (pY <= (SCAN_Y + SCAN_H))) {
          Serial.println("Scan Button Hit");
          if (esp32SAttached) SetWiFiScanButton(true);
        }
      }

      // Look for I/O Scan Button Hit
      if ((pX >= IO_X) && (pX <= (IO_X + IO_W))) {
        if ((pY >= IO_Y) && (pY <= (IO_Y + IO_H))) {
          IO_ScanRequested = true;  // Flag if I/O scan is in process
          Serial.println("IO Scan Button Hit");
          SetIOScanButton(true);
        }
      }
      
      // Look for Clock Button Hit
      if ((pX >= CLOCK_X) && (pX <= (CLOCK_X + CLOCK_W))) {
        if ((pY >= CLOCK_Y) && (pY <= (CLOCK_Y + CLOCK_H))) {
          Serial.println("Clock Button Hit");
          SetClockButton(!clockActive);
        }
      }
    }
  }
  // If we requested a WiFi scan, look for serial data coming from the ESP32S
  if (WiFi_ScanRequested && ESP32SERIAL.available()) {
    audioUpdatePause = true;  // Pause any audio level updates if audio playing
    Serial.println("Read incoming data");
    tft.fillRect(0, 260, 595, 220, RA8875_BLUE);  // Clear any previous text
    tft.setCursor(10, 280);
    while (ESP32SERIAL.available()) {  // Print the scan data to the LCD & USB
      String returnData = ESP32SERIAL.readString();
      tft.println(returnData);
      Serial.println(returnData);
    }
    SetWiFiScanButton(false);
    audioUpdatePause = false;
  }

  // Update audio levels every 30 milliseconds if audio is playing
  if ((msecs > 30) && audioPlaying && !audioUpdatePause) UpdateAudioLevels();
  
  // Update clock every 1000 milliseconds (1 second) if active
  if ((clockTimer > 1000) && clockActive) {
    UpdateClock();
    clockTimer = 0;
  }
}
//===============================================================================
//  Routine to draw Audio button current state and control audio playback
//===============================================================================
void SetAudioButton(boolean audio) {
  tft.setCursor(AUDIO_X + 8, AUDIO_Y + 8);
  tft.setTextColor(RA8875_WHITE);

  if (!audio) {  // button is set inactive, redraw button inactive
    tft.fillRoundRect(AUDIO_X, AUDIO_Y, AUDIO_W, AUDIO_H, 4, RA8875_RED);
    tft.print("Play Audio");
    audioPlaying = false;
    if (audioAdapterAttached) {
      // Clear audio level info
      tft.fillRect(LEFT_X, LEFT_Y - LEFT_H, LEFT_W, LEFT_H, RA8875_BLUE);
      tft.fillRect(RIGHT_X, RIGHT_Y - RIGHT_H, RIGHT_W, RIGHT_H, RA8875_BLUE);
      tft.setTextColor(RA8875_WHITE, RA8875_BLUE);
      tft.setCursor(LEFT_X, LEFT_Y + 20);
      tft.print("0.00");
      tft.setCursor(RIGHT_X, RIGHT_Y + 20);
      tft.print("0.00");
    }
    if (playSdWav1.isPlaying()) {  // Stop any audio that is playing
      playSdWav1.stop();
      Serial.println("Audio being stopped");
    }
  } else {  // button is active, redraw button active
    tft.fillRoundRect(AUDIO_X, AUDIO_Y, AUDIO_W, AUDIO_H, 4, RA8875_GREEN);
    tft.print("Playing");
    audioPlaying = true;
    if (audioAdapterAttached && !playSdWav1.isPlaying()) {  // Play audio file
      Serial.println("Audio being played");
      playSdWav1.play("SDTEST2.WAV");
      delay(10);  // wait for library to parse WAV info
    }
  }
  delay(500);  // Minimize double-hits on Audio button
}
//===============================================================================
//  Routine to draw WiFi scan button current state and initiate scan request
//===============================================================================
void SetWiFiScanButton(boolean scanning) {
  tft.setCursor(SCAN_X + 8, SCAN_Y + 8);
  tft.setTextColor(RA8875_WHITE);

  if (!scanning) {  // Redraw button inactive
    tft.fillRoundRect(SCAN_X, SCAN_Y, SCAN_W, SCAN_H, 4, RA8875_RED);
    tft.print("Scan WiFi");
    WiFi_ScanRequested = false;  // Reset the scan flag
  } else {                       // Button is active, redraw button active
    tft.fillRoundRect(SCAN_X, SCAN_Y, SCAN_W, SCAN_H, 4, RA8875_GREEN);
    tft.print("Scanning");
    ESP32SERIAL.println("S");   // Send command to ESP32 to start scan
    WiFi_ScanRequested = true;  // Set flag that we requested scan
    Serial.println("Scan being requested");
  }
}
//===============================================================================
//  Routine to update I/O scan button state and do I/O scan
//===============================================================================
void SetIOScanButton(boolean scanning) {
  int data;
  if (scanning) {
    tft.setCursor(IO_X + 8, IO_Y + 8);
    tft.setTextColor(RA8875_WHITE);
    tft.fillRoundRect(IO_X, IO_Y, IO_W, IO_H, 4, RA8875_GREEN);
    tft.print("I/O Scanning");
    tft.fillRect(0, 260, 595, 220, RA8875_BLUE);  // Clear any previous text
    tft.setCursor(0, 280);
    // Read MUX 1 pins.  These were setup as analog inputs so will read
    // floating values of around 500 unless connected to a voltage source
    // like a pot or 3V or GND
    tft.print("MUX1 Analog Data = ");
    Serial.println("I/O Scan");
    Serial.println("MUX 1 Analog Data");
    for (int i = 0; i < 8; i++) {  // Read all MUX 1 inputs
      mux1.channel(i);             // Select MUX channel
      delayMicroseconds(100);      // Delay to allow mux to settle
      data = mux1.read(i);         // Read and display the data
      tft.print(data);
      if (i < 7) tft.print(", ");
      Serial.print(i);
      Serial.print(" = ");
      Serial.println(data);
    }
    tft.println();
    tft.println();
    Serial.println();
    Serial.println("MUX 2 Analog Data");
    tft.print("MUX2 Analog Data = ");
    for (int i = 0; i < 8; i++) {
      mux2.channel(i);
      delayMicroseconds(100);
      data = mux2.read(i);
      tft.print(data);
      if (i < 7) tft.print(", ");
      Serial.print(i);
      Serial.print(" = ");
      Serial.println(data);
    }
    tft.println();
    tft.println();
    // Read all MCP23017 inputs.  Pins configured as inputs with pullups so
    // should read all 1's unless input is pulled low.
    tft.print("MCP23017 Digital Data = ");
    Serial.println();
    Serial.println("MCP23017 Digital Data");
    for (int i = 0; i < 16; i++) {
      data = mcp.digitalRead(i);
      tft.print(data);
      if (i < 15) tft.print(", ");
      Serial.print(i);
      Serial.print(" = ");
      Serial.println(data);
    }

    delay(500);  // Just so button is visibly pressed
    tft.setCursor(IO_X + 8, IO_Y + 8);
    tft.setTextColor(RA8875_WHITE);
    tft.fillRoundRect(IO_X, IO_Y, IO_W, IO_H, 4, RA8875_RED);
    tft.print("I/O Scan");
  }
  IO_ScanRequested = false;
}
//===============================================================================
//  Routine to update Audio level bars if audio playing
//===============================================================================
void UpdateAudioLevels() {
  if (peak1.available() && peak2.available()) {
    msecs = 0;
    float leftNumber = peak1.read();
    float rightNumber = peak2.read();

    int height = leftNumber * LEFT_H;
    tft.fillRect(LEFT_X, LEFT_Y - height, LEFT_W, height, RA8875_GREEN);
    tft.fillRect(LEFT_X, LEFT_Y - LEFT_H, LEFT_W, LEFT_H - height, RA8875_BLUE);
    height = rightNumber * RIGHT_H;
    tft.fillRect(RIGHT_X, RIGHT_Y - height, RIGHT_W, height, RA8875_RED);
    tft.fillRect(RIGHT_X, RIGHT_Y - RIGHT_H, RIGHT_W, RIGHT_H - height, RA8875_BLUE);
    // draw numbers underneath each bar.
    tft.setTextColor(RA8875_WHITE, RA8875_BLUE);
    tft.setCursor(LEFT_X, LEFT_Y + 20);
    tft.print(leftNumber);
    tft.setCursor(RIGHT_X, RIGHT_Y + 20);
    tft.print(rightNumber);
  }
}

//===============================================================================
//  Routine to handle Clock button and initialize world clock display
//===============================================================================
void SetClockButton(boolean active) {
  tft.setCursor(CLOCK_X + 8, CLOCK_Y + 8);
  tft.setTextColor(RA8875_WHITE);

  if (active) {
    tft.fillRoundRect(CLOCK_X, CLOCK_Y, CLOCK_W, CLOCK_H, 4, RA8875_GREEN);
    tft.print("Clock On");
    clockActive = true;
    
    // Connect to WiFi and sync time if not already done
    if (!timeSet && esp32SAttached) {
      tft.fillRect(0, 260, 595, 220, RA8875_BLUE);  // Clear any previous text
      tft.setCursor(10, 280);
      tft.println("Connecting to WiFi...");
      Serial.println("Connecting to WiFi...");
      
      // Send WiFi connection command to ESP32
      ESP32SERIAL.print("W");
      ESP32SERIAL.print(wifi_ssid);
      ESP32SERIAL.print("|");
      ESP32SERIAL.println(wifi_password);
      
      // Wait for confirmation from ESP32
      unsigned long startTime = millis();
      while (!ESP32SERIAL.available() && (millis() - startTime < 10000)); // Wait up to 10 seconds
      
      if (ESP32SERIAL.available()) {
        String response = ESP32SERIAL.readString();
        if (response.indexOf("CONNECTED") >= 0) {
          tft.println("WiFi connected!");
          Serial.println("WiFi connected!");
          
          // Sync time from NTP
          tft.println("Syncing time...");
          Serial.println("Syncing time...");
          ESP32SERIAL.println("T"); // Command to get time from NTP
          
          // Wait for time response
          startTime = millis();
          while (!ESP32SERIAL.available() && (millis() - startTime < 5000)); // Wait up to 5 seconds
          
          if (ESP32SERIAL.available()) {
            String timeResponse = ESP32SERIAL.readString();
            if (timeResponse.indexOf("TIME:") >= 0) {
              // Parse time from response (format: TIME:1619712345)
              unsigned long epoch = timeResponse.substring(5).toInt();
              setTime(epoch);
              timeSet = true;
              tft.println("Time synchronized!");
              Serial.println("Time synchronized!");
            } else {
              tft.println("Failed to sync time.");
              Serial.println("Failed to sync time.");
            }
          } else {
            tft.println("No response for time sync.");
            Serial.println("No response for time sync.");
          }
        } else {
          tft.println("WiFi connection failed.");
          Serial.println("WiFi connection failed.");
        }
      } else {
        tft.println("No response from ESP32.");
        Serial.println("No response from ESP32.");
      }
    }
    
    // Clear display area and draw clock frame
    tft.fillRect(0, 260, 595, 220, RA8875_BLUE);
    for (int i = 0; i < NUM_TIMEZONES; i++) {
      int y = 280 + i * 40;
      tft.setCursor(10, y);
      tft.setTextColor(RA8875_YELLOW);
      tft.print(timezone_names[i]);
      tft.print(": ");
    }
    
    // Do initial clock update
    UpdateClock();
    
  } else {
    tft.fillRoundRect(CLOCK_X, CLOCK_Y, CLOCK_W, CLOCK_H, 4, RA8875_RED);
    tft.print("World Clock");
    clockActive = false;
    
    // Clear clock display area
    tft.fillRect(0, 260, 595, 220, RA8875_BLUE);
  }
}

//===============================================================================
//  Routine to update the world clock display
//===============================================================================
void UpdateClock() {
  time_t localTime = now();
  
  for (int i = 0; i < NUM_TIMEZONES; i++) {
    // Calculate time for this timezone
    int offset = timezone_offsets[i];
    time_t zoneTime = localTime + (offset * 3600); // Add timezone offset
    
    // Format time: HH:MM:SS Weekday Month DD, YYYY
    char timeStr[50];
    sprintf(timeStr, "%02d:%02d:%02d %s %s %02d, %04d",
      hour(zoneTime), minute(zoneTime), second(zoneTime),
      dayShortStr(weekday(zoneTime)), monthShortStr(month(zoneTime)),
      day(zoneTime), year(zoneTime));
    
    // Update display
    int y = 280 + i * 40;
    tft.fillRect(100, y, 450, 30, RA8875_BLUE); // Clear previous time
    tft.setCursor(100, y);
    tft.setTextColor(RA8875_WHITE);
    tft.print(timeStr);
  }
}
