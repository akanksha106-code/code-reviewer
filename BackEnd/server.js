require('dotenv').config()
const app = require('./src/app')

const PORT = process.env.PORT || 3000

console.log('Starting server on port ' + PORT + '...')

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV}`)
})

server.on('error', (error) => {
    console.error('Server error:', error)
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close any other applications using this port.`)
    }
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
})