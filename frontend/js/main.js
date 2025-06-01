// Main application logic for index.html
document.addEventListener("DOMContentLoaded", () => {
  console.log("Main.js loaded")

  // Check if user is already logged in
  if (window.auth.isAuthenticated()) {
    console.log("User is authenticated, redirecting to dashboard")
    window.location.href = "dashboard.html"
    return
  }

  // Login form handler
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    console.log("Login form found, adding event listener")
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault()
      console.log("Login form submitted")

      const submitButton = this.querySelector('button[type="submit"]')
      const originalText = submitButton.innerHTML

      // Show loading state
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Kirish...'
      submitButton.disabled = true

      try {
        const formData = window.ui.getFormData(this)
        console.log("Login form data:", formData)

        const result = await window.auth.login(formData.email, formData.password)
        console.log("Login result:", result)

        if (result.success) {
          window.ui.showToast("Muvaffaqiyatli kirildi!")
          setTimeout(() => {
            window.location.href = "dashboard.html"
          }, 1000)
        } else {
          window.ui.showToast(result.error || "Login xatosi", "error")
        }
      } catch (error) {
        console.error("Login form error:", error)
        window.ui.showToast("Kutilmagan xatolik yuz berdi", "error")
      } finally {
        // Restore button state
        submitButton.innerHTML = originalText
        submitButton.disabled = false
      }
    })
  } else {
    console.error("Login form not found!")
  }

  // Register form handler
  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    console.log("Register form found, adding event listener")
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault()
      console.log("Register form submitted")

      const submitButton = this.querySelector('button[type="submit"]')
      const originalText = submitButton.innerHTML

      // Show loading state
      submitButton.innerHTML = "<i class=\"fas fa-spinner fa-spin mr-2\"></i>Ro'yxatdan o'tish..."
      submitButton.disabled = true

      try {
        const formData = window.ui.getFormData(this)
        console.log("Register form data:", formData)

        const result = await window.auth.register(formData)
        console.log("Register result:", result)

        if (result.success) {
          window.ui.showToast("Muvaffaqiyatli ro'yxatdan o'tdingiz!")
          window.ui.closeModal("registerModal")

          if (result.autoLogin) {
            setTimeout(() => {
              window.location.href = "dashboard.html"
            }, 1000)
          } else {
            window.ui.openModal("loginModal")
          }
        } else {
          window.ui.showToast(result.error || "Ro'yxatdan o'tish xatosi", "error")
        }
      } catch (error) {
        console.error("Register form error:", error)
        window.ui.showToast("Kutilmagan xatolik yuz berdi", "error")
      } finally {
        // Restore button state
        submitButton.innerHTML = originalText
        submitButton.disabled = false
      }
    })
  } else {
    console.error("Register form not found!")
  }

  // Quick request form handler
  let currentStep = 1
  let userInfoData = {}

  const requestInfoForm = document.getElementById("requestInfoForm")
  if (requestInfoForm) {
    console.log("Quick request form found")
    requestInfoForm.addEventListener("submit", async function (e) {
      e.preventDefault()
      console.log("Quick request form submitted")

      const submitButton = this.querySelector('button[type="submit"]')
      const originalText = submitButton.innerHTML

      // Show loading state
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Yuborilmoqda...'
      submitButton.disabled = true

      try {
        const requestData = window.ui.getFormData(this)
        console.log("Request data:", requestData)
        console.log("User info data:", userInfoData)

        const userData = {
          full_name: userInfoData.full_name,
          email: userInfoData.email,
          phone: userInfoData.phone,
        }

        const data = {
          user: userData,
          request: requestData,
        }

        console.log("Sending quick request:", data)

        const response = await window.api.createSupportRequestWithUser(data)
        console.log("Quick request response:", response)

        if (response.ok) {
          const responseData = await response.json()
          console.log("Quick request response data:", responseData)

          if (responseData.access_token) {
            localStorage.setItem("access_token", responseData.access_token)
            await window.auth.loadCurrentUser()
          }

          window.ui.showToast("So'rov muvaffaqiyatli yuborildi!")
          window.ui.closeModal("quickRequestModal")

          // Reset form and step
          resetQuickRequestForm()

          if (window.auth.isAuthenticated()) {
            setTimeout(() => {
              window.location.href = "dashboard.html"
            }, 2000)
          }
        } else {
          const error = await response.json()
          console.error("Quick request failed:", error)
          window.ui.showToast(error.detail || "Xatolik yuz berdi", "error")
        }
      } catch (error) {
        console.error("Quick request error:", error)
        window.ui.showToast("Tarmoq xatosi yoki server ishlamayapti", "error")
      } finally {
        // Restore button state
        submitButton.innerHTML = originalText
        submitButton.disabled = false
      }
    })
  }

  function resetQuickRequestForm() {
    currentStep = 1
    document.getElementById("step1").classList.remove("hidden")
    document.getElementById("step2").classList.add("hidden")
    document.getElementById("step1Indicator").className =
      "w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg"
    document.getElementById("step2Indicator").className =
      "w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium"

    document.getElementById("userInfoForm").reset()
    document.getElementById("requestInfoForm").reset()
    userInfoData = {}
  }

  // Make functions global for HTML onclick handlers
  window.nextStep = () => {
    const userInfoForm = document.getElementById("userInfoForm")
    const formData = window.ui.getFormData(userInfoForm)

    if (!formData.full_name || !formData.email || !formData.phone) {
      window.ui.showToast("Barcha maydonlarni to'ldiring", "error")
      return
    }

    const emailRegex =/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if (!emailRegex.test(formData.email)) {
      window.ui.showToast("Email noto'g'ri kiritildi", "error")
      return
    }

    userInfoData = formData

    // Update step indicators
    document.getElementById("step1Indicator").className =
      "w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg"
    document.getElementById("step2Indicator").className =
      "w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg"

    // Show/hide steps
    document.getElementById("step1").classList.add("hidden")
    document.getElementById("step2").classList.remove("hidden")

    currentStep = 2
  }

  window.prevStep = () => {
    // Update step indicators
    document.getElementById("step1Indicator").className =
      "w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg"
    document.getElementById("step2Indicator").className =
      "w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium"

    // Show/hide steps
    document.getElementById("step1").classList.remove("hidden")
    document.getElementById("step2").classList.add("hidden")

    currentStep = 1
  }

  // Close modals when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("fixed") && e.target.classList.contains("inset-0")) {
      const modals = ["loginModal", "registerModal", "quickRequestModal"]
      modals.forEach((modalId) => {
        const modal = document.getElementById(modalId)
        if (modal && !modal.classList.contains("hidden")) {
          window.ui.closeModal(modalId)
        }
      })
    }
  })

  console.log("Main.js initialization complete")
})
