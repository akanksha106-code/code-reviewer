require('dotenv').config()
const app = require('./src/app')

// Explicitly use port 3001 to avoid any confusion
const PORT = 3001

console.log('Starting server on port ' + PORT + '...')

// Add error handling
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
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