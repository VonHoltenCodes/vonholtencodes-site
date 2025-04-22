/*
  Teensy 4.1 Simple World Clock
  
  This program displays a world clock on the RA8875 LCD display
  connected to a Teensy 4.1.
  
  It uses an ESP32 to get the current time from an NTP server
  and displays the time for multiple time zones.
*/

#include <SPI.h>
#include <RA8875.h>
#include <TimeLib.h>

// Pins used for LCD - Using SPI1 bus
#define RA8875_CS 5
#define RA8875_RESET 9
#define RA8875_MOSI 26 
#define RA8875_SCLK 27
#define RA8875_MISO 39

// Setup LCD to use SPI1
RA8875 tft = RA8875(RA8875_CS, RA8875_RESET, RA8875_MOSI, RA8875_SCLK, RA8875_MISO);

// Define Clock button location and size
#define CLOCK_X 320
#define CLOCK_Y 10
#define CLOCK_W 125
#define CLOCK_H 32

// ESP32 is attached to Serial7 port (pins 28 & 29)
#define ESP32SERIAL Serial7

// Misc flags
boolean clockActive = false;           // Flag if world clock is displayed
boolean timeIsSet = false;             // Flag if time has been set from NTP
boolean esp32SAttached = false;        // Flag if ESP32S is attached

// WiFi credentials - set these in a secure way in your implementation
const char* wifi_ssid = "your_wifi_ssid";
const char* wifi_password = "your_wifi_password";

// Time zone offsets in hours
const int NUM_TIMEZONES = 4;
const char* timezone_names[NUM_TIMEZONES] = {"Local", "London", "Tokyo", "Sydney"};
const int timezone_offsets[NUM_TIMEZONES] = {-5, 0, 9, 10};  // EDT, GMT, JST, AEST

// Setup timer for clock updates
elapsedMillis clockTimer;

// Function prototypes
void SetClockButton(boolean);     // Handles Clock button when touched
void UpdateClock();               // Updates the world clock display

//===============================================================================
//  Initialization
//===============================================================================
void setup() {
  Serial.begin(115200);       // Initialize USB serial port to computer
  delay(1000);                // Give serial monitor time to start up
  Serial.println("\n\n*** Teensy 4.1 Simple World Clock Starting ***");
  
  ESP32SERIAL.begin(115200);  // Initialize Serial7 connected to ESP32S
  Serial.println("Serial7 initialized for ESP32 communication");

  // Setup LCD screen
  Serial.println("Initializing LCD screen...");
  tft.begin(RA8875_800x480);
  Serial.println("LCD initialized successfully");
  
  tft.setRotation(2);   // Rotates both screen and touchscreen
  tft.brightness(255);  // Set brightness to max (default)
  
  // Do a basic LCD test to verify display is working
  Serial.println("Running LCD test pattern...");
  tft.fillWindow(RA8875_RED);
  delay(500);
  tft.fillWindow(RA8875_GREEN);
  delay(500);
  tft.fillWindow(RA8875_BLUE);
  delay(500);

  tft.fillWindow(RA8875_BLUE);     // Fill window blue
  tft.setTextColor(RA8875_WHITE);  // White text, transparent background
  tft.setCursor(10, 10);           // Set initial cursor position
  tft.println("Teensy 4.1 World Clock");
  tft.println();

  // Check for ESP32 installed
  Serial.println("Checking for ESP32...");
  
  // Clear any existing serial buffer
  while (ESP32SERIAL.available()) {
    ESP32SERIAL.read();
  }
  
  ESP32SERIAL.print("?");         // Ask ESP32 if it is there
  Serial.println("Sent '?' to ESP32");
  delay(1000);                     // Wait longer for ESP32 to respond
  
  // Try multiple attempts with longer delays
  int attempts = 5;
  while (attempts > 0 && !ESP32SERIAL.available()) {
    Serial.print("Retrying ESP32 check... ");
    Serial.println(attempts);
    ESP32SERIAL.print("?");
    delay(1000);  // Longer delay
    attempts--;
  }
  
  if (ESP32SERIAL.available()) {  // If there is a response
    String returnData = ESP32SERIAL.readString();
    Serial.print("ESP32 response: '");
    Serial.print(returnData);
    Serial.println("'");
    
    if (returnData.indexOf("Y") >= 0) {  // ESP32S responded with Y for Yes, I'm here
      esp32SAttached = true;
      Serial.println("ESP32S was found!");
      tft.println("ESP32S was found!");
    } else {  // Invalid response
      Serial.print("ESP32S invalid response: '");
      Serial.print(returnData);
      Serial.println("'");
      tft.println("ESP32S invalid response");
      // Try once more to see if it works anyway
      esp32SAttached = true;
    }
  } else {  // ESP32S did not respond
    Serial.println("ESP32S not found after multiple attempts");
    tft.println("ESP32S not found - using demo mode");
    
    // Set ESP to true anyway for now for testing
    esp32SAttached = false;
  }
  
  // Print pin information for debugging
  Serial.println("\nTeensy Serial7 connection to ESP32:");
  Serial.println("TX7: Pin 29");
  Serial.println("RX7: Pin 28");
  Serial.println("Make sure these are connected to the ESP32's RX and TX pins respectively");

  // Setup Clock button
  tft.setCursor(CLOCK_X + 8, CLOCK_Y + 8);
  tft.setTextColor(RA8875_WHITE);
  tft.fillRoundRect(CLOCK_X, CLOCK_Y, CLOCK_W, CLOCK_H, 4, RA8875_RED);
  tft.print("World Clock");
  
  // Setup ESP32 
  if (!esp32SAttached) {  // If no ESP32, still allow clock in demo mode
    Serial.println("ESP32 not found - clock will use default time");
    // Set a default time since no NTP
    setTime(12, 0, 0, 20, 4, 2025); // 12:00:00 April 20, 2025
  }
  
  // Activate the clock automatically
  SetClockButton(true);
}

//===============================================================================
//  Main
//===============================================================================
void loop() {
  // Update clock every 1000 milliseconds (1 second) if active
  if ((clockTimer > 1000) && clockActive) {
    UpdateClock();
    clockTimer = 0;
  }
  
  // Simple button handling
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 'c' || c == 'C') {
      SetClockButton(!clockActive);
    }
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
    if (!timeIsSet && esp32SAttached) {
      tft.fillRect(0, 100, 595, 220, RA8875_BLUE);  // Clear any previous text
      tft.setCursor(10, 120);
      tft.println("Connecting to WiFi...");
      Serial.println("Connecting to WiFi...");
      
      // Send WiFi connection command to ESP32
      // Note: credentials are handled securely and not logged
      ESP32SERIAL.print("W");
      ESP32SERIAL.print(wifi_ssid);
      ESP32SERIAL.print("|");
      ESP32SERIAL.println(wifi_password); // In production, use a secure method to handle credentials
      
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
              timeIsSet = true;
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