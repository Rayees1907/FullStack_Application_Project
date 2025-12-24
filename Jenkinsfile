pipeline {
    agent any

    environment {
        DATABASE_URL = credentials('DATABASE_URL')
        JWT_SECRET   = credentials('JWT_SECRET')
        PORT         = '4000'
    }

    stages {

        stage("Code Clone") {
            steps {
                echo "Cloning the repository..."
                git url: "https://github.com/Rayees1907/FullStack_Application_Project.git", branch: "main"
                echo "Repository cloned."
            }
        }

        stage("Build") {
            steps {
                echo "Building Docker images..."
                sh "docker compose build --no-cache"
                echo "Docker images built."
            }
        }

        stage("DockerHub Login") {
            steps {
                echo "Logging into DockerHub..."
                withCredentials([usernamePassword(
                    credentialsId: 'dockerHubCreds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
                echo "Logged into DockerHub."
            }
        }

        stage("Push Images") {
            steps {
                echo "Pushing Docker images to DockerHub..."
                sh "docker compose push"
                echo "Docker images pushed."
            }
        }

        stage("Deploy") {
            steps {
                echo "Deploying application using Docker Compose..."
                sh "docker compose down"
                sh "docker compose up -d --force-recreate"
                echo "Application deployed."
            }
        }
    }
}
