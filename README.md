# Library of Thoughts

![Library of Thoughts Banner](https://)

## Table of Contents
* [Project Overview](#project-overview)
* [Key Features](#key-features)
* [Technology Stack](#technology-stack)
    * [Application Stack](#application-stack)
    * [Deployment & DevOps Stack](#deployment--devops-stack)
* [Architecture Overview](#architecture-overview)
* [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation (Local Development)](#installation-local-development)
* [Deployment](#deployment)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

---

## Project Overview

The "Library of Thoughts" is a personal journaling and reflection web application designed to help users capture, organize, and revisit their insights, reflections, and ideas. It provides a structured yet flexible environment for documenting thoughts, creating a personal digital archive of one's intellectual and emotional journey.

This application moves beyond simple note-taking by encouraging users to categorize and reflect upon their entries, making it easier to retrieve and learn from past thoughts. It aims to be a valuable tool for personal growth, learning, and self-awareness.

---

## Key Features

* **User Authentication:** Secure user registration and login using **Passport.js**, ensuring privacy and exclusive access to personal thoughts.
* **Thought Management (CRUD):** Users can seamlessly **create, read, update, and delete** their "thoughts" (reflections, insights, ideas).
* **Categorization:** Organize thoughts effectively with a robust categorization system, allowing for better filtering and retrieval.
* **Data Persistence:** All user data and thoughts are securely stored in a **cloud-hosted database**.
* **Responsive Design:** Enjoy a consistent and accessible experience across various devices, including desktops, tablets, and mobile phones.

---

## Technology Stack

The "Library of Thoughts" project leverages a modern and robust technology stack, encompassing both client-side and server-side components, along with a sophisticated deployment infrastructure.

### Application Stack

* **Frontend:**
    * **HTML5:** For structuring web content.
    * **CSS3:** For styling and visual presentation.
    * **JavaScript:** For interactive elements and dynamic content.
* **Backend (Server-Side):**
    * **Node.js:** A fast and scalable JavaScript runtime environment.
    * **Express.js:** A minimalist web framework for building the RESTful API, handling routes, and server logic.
    * **Mongoose.js:** An elegant MongoDB object modeling tool for Node.js, simplifying database interactions.
    * **Dotenv:** For managing environment variables securely.
    * **Passport.js:** Authentication middleware for user registration, login, and session management.
    * **Express-session:** Middleware for managing user sessions.
    * **Bcrypt.js:** For securely hashing user passwords.
    * **Connect-flash:** For displaying ephemeral messages (e.g., success/error).
* **Database:**
    * **MongoDB Atlas (M0 Sandbox):** A cloud-hosted NoSQL database service, providing a flexible and scalable solution for storing user thoughts and profiles.

### Deployment & DevOps Stack

* **Containerization:**
    * **Docker:** Used to containerize the Node.js application, ensuring consistent behavior across environments.
* **Cloud Infrastructure (AWS):**
    * **AWS EC2 (Elastic Compute Cloud):** A virtual server instance (t2.micro) hosting the Docker container.
    * **AWS ECR (Elastic Container Registry):** A fully managed Docker container registry for storing and managing application images.
    * **AWS IAM (Identity and Access Management):** For managing user permissions and roles within AWS.
    * **AWS Security Groups:** Virtual firewalls controlling inbound and outbound traffic to EC2 instances.
* **Web Server & SSL:**
    * **Nginx:** A high-performance web server and reverse proxy, handling requests and serving static files.
    * **Let's Encrypt:** Provides free, automated SSL/TLS certificates.
    * **Certbot:** Automates the process of obtaining and renewing Let's Encrypt certificates for Nginx.
* **Continuous Integration/Continuous Deployment (CI/CD):**
    * **GitHub Actions:** Automates the entire deployment pipeline (build, push to ECR, deploy to EC2) upon code pushes to the `main` branch.
    * **GitHub Secrets:** Securely stores sensitive credentials for CI/CD workflows.

---

## Architecture Overview

The "Library of Thoughts" application follows a robust client-server architecture with a clear separation of concerns:

* **Client (User's Browser):** Interacts with the application's frontend (HTML, CSS, JavaScript).
* **Web Server (Nginx on EC2):**
    * Receives all incoming HTTP (port 80) and HTTPS (port 443) requests.
    * Acts as a reverse proxy, forwarding dynamic requests to the Docker container running the Node.js application.
    * Handles static file serving (e.g., for a portfolio, if applicable).
* **Application Container (Docker on EC2):**
    * Runs the Node.js/Express.js backend.
    * Connects to MongoDB Atlas for data storage and retrieval.
* **Database (MongoDB Atlas):** A separate, cloud-hosted database cluster storing all application data.

---

## Getting Started

Follow these steps to get a local copy of the project up and running on your machine.

### Prerequisites

* Node.js (LTS version recommended)
* npm (Node Package Manager)
* MongoDB Atlas account (for cloud database) or a local MongoDB instance
* Docker (if you plan to run it containerized locally)

### Installation (Local Development)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/ashil-mascarenhas/library-of-thoughts.git](https://github.com/ashil-mascarenhas/library-of-thoughts.git)
    cd library-of-thoughts
    ```
2.  **Install backend dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file:**
    In the root directory, create a file named `.env` and add your environment variables.
    ```env
    MONGO_URI=your_mongodb_atlas_connection_string
    SESSION_SECRET=a_strong_random_secret_string
    # Add any other environment variables your application needs
    ```
    Replace `your_mongodb_atlas_connection_string` with your actual MongoDB Atlas connection string. You can generate a strong `SESSION_SECRET` online.
4.  **Run the application:**
    ```bash
    npm start
    ```
    The application should now be running on `http://localhost:3000` (or the port configured in your Express app).

---

## Deployment

The "Library of Thoughts" is deployed with a robust CI/CD pipeline using **GitHub Actions**, **Docker**, and **AWS services (EC2, ECR)**. **Nginx** serves as a reverse proxy with **Let's Encrypt** for HTTPS. The deployment process is fully automated upon pushes to the `main` branch.

For detailed deployment steps and configurations, please refer to the `github/workflows` directory in this repository and the relevant AWS console settings.

---

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature X'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
*(Create a LICENSE file in your repository if you haven't already)*

---

## Contact

Ashil | [Portfolio](https://portfolio.builtbyashil.site/) | [LinkedIn](https://www.linkedin.com/in/ashil-mascarenhas/) | [GitHub](https://github.com/ashil-mascarenhas)

---
