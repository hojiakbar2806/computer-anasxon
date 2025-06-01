// Authentication management
const auth = {
  currentUser: null,

  async login(email, password) {
    console.log("Auth login attempt:", email)
    try {
      const response = await window.api.login(email, password)
      console.log("Login response:", response)

      if (response.ok) {
        const data = await response.json()
        console.log("Login data:", data)

        localStorage.setItem("access_token", data.access_token)

        // If user data is included in login response
        if (data.user) {
          this.currentUser = data.user
          localStorage.setItem("currentUser", JSON.stringify(this.currentUser))
        } else {
          // Get user info separately
          await this.loadCurrentUser()
        }

        return { success: true }
      } else {
        const error = await response.json()
        console.error("Login failed:", error)
        return { success: false, error: error.detail || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Tarmoq xatosi yoki server ishlamayapti" }
    }
  },

  async register(userData) {
    console.log("Auth register attempt:", userData)
    try {
      const response = await window.api.register(userData)
      console.log("Register response:", response)

      if (response.ok) {
        const data = await response.json()
        console.log("Register data:", data)

        // Auto login if token is provided
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token)
          if (data.user) {
            this.currentUser = data.user
            localStorage.setItem("currentUser", JSON.stringify(this.currentUser))
          } else {
            await this.loadCurrentUser()
          }
          return { success: true, autoLogin: true }
        }

        return { success: true, autoLogin: false }
      } else {
        const error = await response.json()
        console.error("Register failed:", error)
        return { success: false, error: error.detail || "Registration failed" }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Tarmoq xatosi yoki server ishlamayapti" }
    }
  },

  async loadCurrentUser() {
    console.log("Loading current user...")
    try {
      // First check localStorage
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)
        console.log("Loaded user from localStorage:", this.currentUser)
        return this.currentUser
      }

      // Then try API
      const response = await window.api.getCurrentUser()
      console.log("Get current user response:", response)

      if (response.ok) {
        this.currentUser = await response.json()
        localStorage.setItem("currentUser", JSON.stringify(this.currentUser))
        console.log("Loaded user from API:", this.currentUser)
        return this.currentUser
      } else {
        console.log("Failed to load user, logging out")
        this.logout()
        return null
      }
    } catch (error) {
      console.error("Load user error:", error)
      this.logout()
      return null
    }
  },

  logout() {
    console.log("Logging out...")
    localStorage.removeItem("access_token")
    localStorage.removeItem("currentUser")
    this.currentUser = null
    window.location.href = "index.html"
  },

  isAuthenticated() {
    const hasToken = localStorage.getItem("access_token") !== null
    console.log("Is authenticated:", hasToken)
    return hasToken
  },

  getUserRole() {
    const role = this.currentUser ? this.currentUser.role : null
    console.log("User role:", role)
    return role
  },
}

// Make auth available globally
window.auth = auth
