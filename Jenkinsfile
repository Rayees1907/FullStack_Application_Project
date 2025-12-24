pipeline {
    agent any
        
    stages {
        stage("Code Clone") {
            steps {
                echo "Cloning the repository..."
                git url: "https://github.com/Rayees1907/FullStack_Application_Project.git", branch: "main"
                echo "Repository cloned successfully."
            }
        }
        stage("Build") {
            steps {
                echo "Building the project..."
                sh "docker compose build --no-cache"
                echo "Build completed successfully."
            }
        }
        stage("dockerhub Login") {
            steps {
                echo "Logging into Docker Hub..."
                withCredentials([usernamePassword(
                    credentialsId: 'dockerHubCreds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
                echo "Logged into Docker Hub successfully."
            }
        }
        stage("Push to Docker Hub") {
            steps {
                echo "Pushing images to Docker Hub..."
                sh "docker compose push"
                echo "Images pushed to Docker Hub successfully."
            }
        }
        stage("Deploy") {
            steps {
                echo "Deploying the application..."
                sh "docker compose down"
                sh "docker compose up -d"
                echo "Application deployed successfully."
            }
        }
    }
}
