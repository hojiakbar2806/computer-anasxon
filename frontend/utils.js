const auth = {
  isAuthenticated: () => {
    return localStorage.getItem("access_token") !== null
  },
  logout: () => {
    localStorage.removeItem("access_token")
    window.location.href = "index.html"
  },
  loadCurrentUser: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          phone: "123-456-7890",
          role: "user",
        })
      }, 500)
    })
  },
}

const API_BASE_URL = "http://localhost:8000"

const api = {
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    const accessToken = localStorage.getItem("access_token")
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    try {
      const response = await fetch(url, config)
      return response
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  },
  getSupportRequests: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: async () => [
            {
              id: "1",
              device_model: "Laptop",
              problem_area: "Screen issue",
              status: "pending",
              issue_type: "hardware",
              description: "Screen is flickering",
              location: "Tashkent",
              created_at: Date.now(),
            },
          ],
        })
      }, 500)
    })
  },
  createSupportRequest: async (requestData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ok: true })
      }, 500)
    })
  },
  updateUser: async (userId, userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ok: true })
      }, 500)
    })
  },
  getUsers: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: async () => [
            {
              id: "1",
              first_name: "John",
              last_name: "Doe",
              email: "john.doe@example.com",
              phone: "123-456-7890",
              role: "user",
            },
          ],
        })
      }, 500)
    })
  },
  getComponents: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: async () => [
            {
              id: "1",
              title: "Screen",
              description: "Laptop screen",
              price: 100,
              in_stock: 10,
            },
          ],
        })
      }, 500)
    })
  },
  updateSupportStatus: async (requestId, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ok: true })
      }, 500)
    })
  },
  sendSupportMaster: async (requestId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ok: true })
      }, 500)
    })
  },
  createSupportRequestWithUser: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ok: true })
      }, 500)
    })
  },
}

const ui = {
  showToast: (message, type = "success") => {
    const toast = document.getElementById("toast")
    const toastMessage = document.getElementById("toastMessage")

    if (toast && toastMessage) {
      toastMessage.textContent = message

      toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
      } text-white`

      toast.classList.remove("hidden")

      setTimeout(() => {
        toast.classList.add("hidden")
      }, 3000)
    }
  },
  populateForm: (formElement, data) => {
    for (const [key, value] of Object.entries(data)) {
      const input = formElement.querySelector(`[name="${key}"]`)
      if (input) {
        input.value = value || ""
      }
    }
  },
  getStatusBadge: (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      checked: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      in_progress: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-gray-100 text-gray-800",
    }

    const statusTexts = {
      pending: "Kutilmoqda",
      checked: "Tekshirildi",
      approved: "Tasdiqlandi",
      in_progress: "Jarayonda",
      rejected: "Rad etildi",
      completed: "Tugallandi",
    }

    const className = statusClasses[status] || "bg-gray-100 text-gray-800"
    const text = statusTexts[status] || status

    return `<span class="px-2 py-1 text-xs font-medium rounded-full ${className}">${text}</span>`
  },
  getIssueTypeIcon: (issueType) => {
    const icons = {
      hardware: "fas fa-laptop",
      software: "fas fa-code",
      network: "fas fa-wifi",
      other: "fas fa-cog",
    }
    return icons[issueType] || "fas fa-question"
  },
  getFormData: (formElement) => {
    const formData = new FormData(formElement)
    const data = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value
    }
    return data
  },
}

export { auth, api, ui }
