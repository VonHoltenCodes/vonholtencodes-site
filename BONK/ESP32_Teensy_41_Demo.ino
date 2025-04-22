/*
  ESP32_Teensy_41_Demo Example

  This program runs on an ESP32-S3 that's connected to a Teensy 4.1 via Serial2.
  It listens for commands from the Teensy and responds appropriately.
  
  Current commands:
  - "?" -> Respond with "Y" (Yes, I'm here)
  - "S" -> Execute WiFi scan and return results
  - "W<ssid>|<password>" -> Connect to WiFi network
  - "T" -> Get time from NTP server and return
  
  The WiFi scan results are sent line by line back to the Teensy.
  Time is returned in the format "TIME:<epoch>" (Unix timestamp).
  
  This is a modified version of the ESP32 WiFiScan example program.
*/

#include <WiFi.h>
#include <time.h>

// NTP settings
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 0;  // GMT offset (0 for GMT)
const int   daylightOffset_sec = 0;  // Daylight savings time offset (0 for no DST)

void setup() {
  Serial.begin(115200);  // Initialize serial to computer
  Serial2.begin(115200); // Initialize serial to Teensy 4.1
  WiFi.mode(WIFI_STA);   // Set WiFi to station mode
  WiFi.disconnect();     // Disconnect from an AP if it was previously connected
  delay(100);
}

void loop() {
  // Check for any commands coming from Teensy 4.1
  if (Serial2.available()) {
    String command = Serial2.readStringUntil('\n');
    command.trim();
    
    // Simple presence check - respond with Y
    if (command == "?") {
      Serial2.println("Y");
      Serial.println("Presence check");
    }
    
    // WiFi scan command
    else if (command == "S") {
      Serial.println("WiFi scan requested");
      WiFiScan();
    }
    
    // WiFi connect command (format: W<ssid>|<password>)
    else if (command.startsWith("W")) {
      String details = command.substring(1); // Remove 'W'
      int separatorIndex = details.indexOf('|');
      
      if (separatorIndex != -1) {
        String ssid = details.substring(0, separatorIndex);
        String password = details.substring(separatorIndex + 1);
        
        Serial.print("Connecting to WiFi: ");
        Serial.println(ssid);
        
        WiFi.begin(ssid.c_str(), password.c_str());
        
        // Wait for connection with timeout
        int timeout = 20; // 10 seconds timeout
        while (WiFi.status() != WL_CONNECTED && timeout > 0) {
          delay(500);
          Serial.print(".");
          timeout--;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
          Serial.println();
          Serial.println("WiFi connected!");
          Serial.print("IP address: ");
          Serial.println(WiFi.localIP());
          Serial2.println("CONNECTED");
        } else {
          Serial.println();
          Serial.println("WiFi connection failed");
          Serial2.println("FAILED");
        }
      }
    }
    
    // Time sync command
    else if (command == "T") {
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Time sync requested");
        
        // Configure NTP and get time
        configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
        
        // Get current time
        struct tm timeinfo;
        if(getLocalTime(&timeinfo)) {
          time_t now;
          time(&now);
          Serial.print("Current time: ");
          Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
          Serial.print("Epoch: ");
          Serial.println(now);
          
          // Send epoch time back to Teensy
          Serial2.print("TIME:");
          Serial2.println(now);
        } else {
          Serial.println("Failed to obtain time");
          Serial2.println("TIME:FAILED");
        }
      } else {
        Serial.println("WiFi not connected - can't sync time");
        Serial2.println("TIME:NOWIFI");
      }
    }
  }
}

// Function to scan WiFi networks and return the results
void WiFiScan() {
  Serial.println("Starting WiFi scan...");
  
  // WiFi.scanNetworks will return the number of networks found
  int n = WiFi.scanNetworks();
  Serial.println("Scan done");
  
  if (n == 0) {
    Serial.println("No networks found");
    Serial2.println("No networks found");
  } else {
    Serial.print(n);
    Serial.println(" networks found");
    Serial2.print(n);
    Serial2.println(" networks found");
    
    for (int i = 0; i < n; ++i) {
      // Print SSID and RSSI for each network found
      Serial.print(i + 1);
      Serial.print(": ");
      Serial.print(WiFi.SSID(i));
      Serial.print(" (");
      Serial.print(WiFi.RSSI(i));
      Serial.print(")");
      Serial.println((WiFi.encryptionType(i) == WIFI_AUTH_OPEN) ? " " : "*");
      
      // Send same info to Teensy
      Serial2.print(i + 1);
      Serial2.print(": ");
      Serial2.print(WiFi.SSID(i));
      Serial2.print(" (");
      Serial2.print(WiFi.RSSI(i));
      Serial2.print(")");
      Serial2.println((WiFi.encryptionType(i) == WIFI_AUTH_OPEN) ? " " : "*");
      
      delay(10);
    }
  }
  Serial.println("");
  Serial2.println("Scan Completed");
}