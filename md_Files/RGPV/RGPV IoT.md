# Internet of Things (IoT)

---

## Unit I — IoT Foundations & Architecture

- IoT Definition & Characteristics (Connected Devices · Smart Objects · Heterogeneity · Scalability · Dynamic Nature · Safety · Connectivity)
- IoT Conceptual Framework (Perception Layer · Network Layer · Application Layer · Business Layer · Middleware Layer)
- IoT Architectural Framework (Domain Model · Information Model · Functional View · Communication View · Operational View)
- Components of IoT Ecosystem (Sensors · Actuators · Gateways · Networks · Cloud · Applications · Users)
- Physical Design of IoT (Things · Resource · Controller Service · Database · Web Service · Analysis Component)
- Logical Design of IoT (IoT Functional Blocks · Communication APIs · APIs for IoT Devices)
- IoT Enablers (RFID · WSN · Middleware · Cloud Computing · IoT Application Software)
- Modern IoT Applications (Smart Home · Smart City · Smart Health · Smart Agriculture · Industrial IoT)
- M2M Communications (Machine to Machine · Cellular M2M · SCADA · Telemetry · Remote Monitoring)
- IoT vs M2M (Scope · Integration · Intelligence · Protocol · Human Involvement · Cloud Dependency)
- IoT vs WoT (Web Integration · REST APIs · HTTP Binding · Semantic Annotation · Discovery)
- IoT Reference Architecture (ITU-T · ETSI · IEEE · ISO/IEC · oneM2M Standards)
- IoT Network Configurations (Star · Mesh · Bus · Tree · Hybrid Topologies)
- IoT LAN (Zigbee · Wi-Fi · Bluetooth · Z-Wave · Thread · 6LoWPAN)
- IoT WAN (Cellular · LPWAN · LoRa · Sigfox · NB-IoT · LTE-M · Satellite)
- IoT Node (Microcontroller · Processor · Memory · Power Unit · Communication Module)
- IoT Gateway (Protocol Translation · Data Aggregation · Security · Local Processing · Edge Computing)
- IoT Proxy (Request Forwarding · Protocol Bridging · Caching · Security Enforcement)
- Basic Microcontrollers (Arduino · PIC · AVR · STM32 · ESP8266 · ESP32)
- Interfacing (GPIO · UART · SPI · I2C · PWM · ADC · DAC)

---

## Unit II — Sensors & Actuators

- Sensor Definition (Physical Quantity → Electrical Signal · Transducer vs Sensor · Sensitivity · Range)
- Sensor Node Components (Sensing Unit · Processing Unit · Transceiver · Power Unit · Location Finding)
- Sensor Node Challenges (Energy Harvesting · Fault Tolerance · Scalability · Production Cost · Operating Environment)
- Sensor Features (Accuracy · Precision · Resolution · Repeatability · Linearity · Sensitivity · Bandwidth)
- Sensor Resolution (Minimum Detectable Change · ADC Bits · Signal-to-Noise Ratio)
- Sensor Classes — Analog (Continuous Output · Temperature · Pressure · Light · Sound)
- Sensor Classes — Digital (Discrete Output · On/Off · Proximity · Touch · Infrared)
- Sensor Classes — Scalar (Single Value · Temperature · Humidity · Pressure · Light Intensity)
- Sensor Classes — Vector (Directional · Accelerometer · Gyroscope · Magnetometer · GPS)
- Sensor Types (Temperature · Pressure · Humidity · Light · Proximity · Chemical · Motion · Biometric)
- Sensor Errors — Bias (Systematic Offset · Zero Error · Calibration)
- Sensor Errors — Drift (Slow Change Over Time · Temperature Drift · Long-term Instability)
- Sensor Errors — Hysteresis (Path-dependent Output · Magnetic Hysteresis · Mechanical Hysteresis)
- Sensor Errors — Quantization (ADC Discretization · Rounding Error · LSB Error)
- Actuator Definition (Electrical Signal → Physical Action · Transducer · Control Element)
- Actuator Types — Hydraulic (Fluid Pressure · Linear · Rotary · High Force · Slow Speed)
- Actuator Types — Pneumatic (Air Pressure · Fast · Clean · Light · Cylinders · Valves)
- Actuator Types — Electrical (Motor · Solenoid · Servo · Stepper · Relay · High Precision)
- Actuator Types — Thermal/Magnetic (Shape Memory Alloy · Bimetallic Strip · Magnetostrictive)
- Actuator Types — Mechanical (Gear · Cam · Linkage · Spring · Lever · Pulley)
- Soft Actuators (Pneumatic Artificial Muscles · Dielectric Elastomers · Hydrogel · Bio-inspired)

---

## Unit III — IoT Networking & Protocols

- IoT Networking Basics (OSI Layers · TCP/IP Stack · Constrained Networks · Low Power · Low Bandwidth)
- IoT Components (End Nodes · Gateways · Cloud · Application Servers · Management Systems)
- Functional Components (Device Management · Connectivity · Analytics · Application Enablement)
- IoT Service Oriented Architecture (Service Registry · Service Discovery · Service Composition · Loose Coupling)
- IoT Challenges (Heterogeneity · Scalability · Security · Privacy · Interoperability · Power · Bandwidth)
- 6LoWPAN (IPv6 over Low-Power · Header Compression · Fragmentation · Mesh Addressing · RFC 4944)
- IEEE 802.15.4 (Physical Layer · MAC Layer · 250 kbps · 2.4 GHz · CSMA/CA · Star/Mesh)
- ZigBee (IEEE 802.15.4 · Network Layer · AES-128 · Self-healing Mesh · Coordinator · Router · End Device)
- ZigBee Types (ZigBee PRO · ZigBee RF4CE · ZigBee IP · ZigBee Green Power · ZigBee 3.0)
- RFID Features (Radio Frequency · Passive/Active/Semi-passive · EPC · Range · Memory · Frequency)
- RFID Working Principle (Reader · Tag · Antenna · Inductive Coupling · Backscatter · Collision Avoidance)
- RFID Applications (Supply Chain · Asset Tracking · Access Control · Retail · Healthcare · Library)
- NFC — Near Field Communication (13.56 MHz · 10 cm Range · ISO 18092 · Read/Write · Peer-to-Peer · Card Emulation)
- Bluetooth (BT Classic · BLE · Piconet · Scatternet · Frequency Hopping · GATT · Profiles)
- Wireless Sensor Networks (WSN) (Nodes · Sink · Base Station · Multi-hop · Routing · Energy Efficiency)
- WSN Applications (Environmental Monitoring · Military · Healthcare · Agriculture · Industrial · Disaster)

---

## Unit IV — IoT Communication Protocols

- MQTT (Message Queuing Telemetry Transport · Publish-Subscribe · Lightweight · TCP · Port 1883/8883)
- MQTT Methods (CONNECT · PUBLISH · SUBSCRIBE · UNSUBSCRIBE · PINGREQ · DISCONNECT)
- MQTT Components (Broker · Publisher · Subscriber · Topic · Message · Session · QoS Levels)
- MQTT Communication (QoS 0: At most once · QoS 1: At least once · QoS 2: Exactly once)
- MQTT Topics (Hierarchical · Wildcards: + Single # Multi · Retained Messages · Will Message)
- MQTT Applications (Home Automation · Industrial Monitoring · Mobile Apps · Smart Meters · Fleet Tracking)
- SMQTT (Secure MQTT · TLS/SSL · Certificate-based · Enhanced Security · Encrypted Payloads)
- CoAP (Constrained Application Protocol · REST-like · UDP · RFC 7252 · Low Overhead)
- CoAP Message Types (CON: Confirmable · NON: Non-confirmable · ACK: Acknowledgement · RST: Reset)
- CoAP Request-Response Model (GET · POST · PUT · DELETE · Observe · Block Transfer · Multicast)
- XMPP (Extensible Messaging and Presence Protocol · XML · Jabber · Federated · Real-time)
- AMQP Features (Advanced Message Queuing Protocol · Binary · Reliable · Store-and-Forward · Broker-based)
- AMQP Components (Broker · Exchange · Queue · Binding · Channel · Connection · Virtual Host)
- AMQP Frame Types (Method · Header · Body · Heartbeat · Direct · Fanout · Topic · Headers Exchange)

---

## Unit V — IoT Platforms, Analytics & Security

- IoT Platforms Overview (Device Management · Connectivity · Analytics · Application Enablement · Cloud)
- Arduino (ATmega328P · IDE · Shields · Digital/Analog Pins · PWM · Libraries · Community)
- Raspberry Pi Board (ARM Cortex · Linux OS · GPIO · Camera · USB · HDMI · SD Card · HATs)
- Raspberry Pi vs Desktop (Purpose-built · GPIO · Low Power · No GPU · Educational · Embedded)
- Raspberry Pi Interfaces — SPI (Serial Peripheral Interface · Master-Slave · MOSI · MISO · SCK · CS)
- Raspberry Pi Interfaces — I2C (Inter-Integrated Circuit · SDA · SCL · Address-based · Multi-device)
- Raspberry Pi GPIO Pins (Input/Output · PWM · UART · SPI · I2C · 3.3V · 5V · Ground)
- Other IoT Platforms (Node-RED · AWS IoT · Azure IoT · Google Cloud IoT · IBM Watson · ThingSpeak)
- Data Analytics for IoT (Edge Analytics · Stream Processing · Batch Analytics · Predictive Analytics)
- Cloud for IoT (IaaS · PaaS · SaaS · Serverless · Scalability · Reliability · Remote Access)
- Cloud Storage Models (Object Storage · Block Storage · File Storage · Time-series DB · NoSQL · SQL)
- Communication APIs (REST · MQTT · WebSocket · CoAP · AMQP · gRPC · GraphQL)
- IoT Security Attacks (Eavesdropping · MITM · DoS · Replay · Sybil · Sinkhole · Wormhole · Botnet)
- IoT Vulnerability Analysis (Insecure Network · Weak Authentication · Outdated Firmware · Poor Encryption)
- Software Defined Networking — SDN (Control Plane · Data Plane · OpenFlow · Controller · Programmable)
- IoT Case Study — Smart Home (Automation · Voice Control · Energy Management · Security · Comfort)
- IoT Case Study — Smart Farming (Soil Sensors · Irrigation Control · Drone Monitoring · Yield Prediction)
- IoT Case Study — Smart City (Traffic · Waste · Energy · Water · Public Safety · Environment)
- IoT Case Study — Smart Health (Wearables · Remote Monitoring · Drug Tracking · Emergency Response)

---