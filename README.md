# BadUSB Payload Generator for Flipper Zero

![Logo](logo.png)

A web UI for generating custom BadUSB payloads for the Flipper Zero device. With this tool, you can easily create and modify payloads that can be used with Flipper Zero's BadUSB feature. 

## Features

- **Web UI**: Simple and intuitive interface to design your BadUSB payloads.
- **Custom Payloads**: Create payloads with different actions, such as typing, executing commands, or sending keystrokes.
- **Flipper Zero Compatibility**: Payloads generated are compatible with the Flipper Zero device.
- **No Programming Required**: Generate payloads without writing any code. _(I know, BadUSB "coding" is not complex at all. But I thought on making it as rookie friendly as possible)_

## Use it online

No install needed — open the hosted version in your browser:

[**davidlahoz.github.io/fz-BadUSB**](https://davidlahoz.github.io/fz-BadUSB/)

## Run locally

1. **Clone the repository**:

   ```bash
   git clone https://github.com/davidlahoz/fz-BadUSB.git
   ```

2. **Open the app**: navigate to the project folder and open `index.html` in your browser. No build step or server required.

## Usage

- **Create a Payload**: Use the form fields in the UI to customize your payload (e.g., select actions, add delays, etc.).
- **Download the Payload**: Once your payload is ready, download the .txt file to load it into your Flipper Zero device.
- **Load the Payload**: Transfer the generated file to your Flipper Zero and use the BadUSB functionality to execute the payload.

## License
This project is licensed under the [MIT License](LICENSE)
