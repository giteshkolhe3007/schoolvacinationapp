const jwt = require('jsonwebtoken')

const VALID_USERNAME = 'ashu'
const VALID_PASSWORD = 'ashu24'

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Create token
    const token = jwt.sign(
      { id: '1', role: 'admin', username: 'admin' },
      process.env.JWT_SECRET || 'fallback_secret_for_development',
      { expiresIn: '1d' }
    )

    res.json({
      token,
      user: {
        id: '1',
        username: 'admin',
        role: 'admin',
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
