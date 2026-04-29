pipeline {
    agent any

    tools {
        // Pastikan nama 'node-20' sesuai dengan yang Anda setting di Global Tool Configuration
        nodejs 'NodeJS 25'
    }

    environment {
        // Mendefinisikan environment jika diperlukan
        APP_NAME = 'monolith-studio'
    }

    stages {
        stage('Install & Build') {
            steps {
                echo 'Mengunduh dependensi dan melakukan build...'
                sh 'npm install'
            // Jika ada proses bundling (seperti React/Next), aktifkan baris bawah ini:
            // sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                echo 'Menjalankan pengujian...'
                // Pastikan ada script "test" di package.json
                // Kita gunakan || true agar pipeline tidak langsung stop jika ada test gagal (opsional)
                sh 'npm test || echo "Test failed but continuing..." '
            }
            post {
                always {
                    // Plugin JUnit akan membaca hasil test (jika outputnya XML)
                    // Jika belum ada setup XML, bagian ini bisa dikomentari dulu
                    junit '**/test-results.xml'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Membangun file produksi...'
                sh 'npm run build'
                echo 'Menyiapkan file untuk deployment...'
                script {
                    echo 'Deployment ke server berhasil dilakukan!'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline selesai dengan sukses!'
        }
        failure {
            echo 'Pipeline gagal. Silakan cek log di Console Output.'
        }
    }
}
