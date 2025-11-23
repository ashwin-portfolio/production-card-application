package com.productioncard.auth

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.productioncard.R
import com.productioncard.dashboard.CardsListActivity
import com.productioncard.models.LoginRequest
import com.productioncard.services.RootDetector
import com.productioncard.storage.SecureStorage
import com.productioncard.utils.ApiClient
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    
    private lateinit var secureStorage: SecureStorage
    private lateinit var apiService: com.productioncard.services.ApiService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        
        secureStorage = SecureStorage(this)
        apiService = ApiClient.getApiService()
        
        // Check if already logged in
        val token = secureStorage.getToken()
        if (token != null) {
            navigateToDashboard()
            return
        }
        
        // Check for root
        if (RootDetector.isDeviceRooted()) {
            val intent = Intent(this, RootedDeviceActivity::class.java)
            startActivity(intent)
            finish()
            return
        }
        
        setupLoginButton()
    }
    
    private fun setupLoginButton() {
        // Assuming you have EditTexts for phone and password
        // val phoneEditText = findViewById<EditText>(R.id.phoneEditText)
        // val passwordEditText = findViewById<EditText>(R.id.passwordEditText)
        // val loginButton = findViewById<Button>(R.id.loginButton)
        
        // loginButton.setOnClickListener {
        //     val phone = phoneEditText.text.toString().trim()
        //     val password = passwordEditText.text.toString()
        //     
        //     if (phone.isEmpty() || password.isEmpty()) {
        //         Toast.makeText(this, "Please enter phone and password", Toast.LENGTH_SHORT).show()
        //         return@setOnClickListener
        //     }
        //     
        //     login(phone, password)
        // }
    }
    
    private fun login(phone: String, password: String) {
        lifecycleScope.launch {
            try {
                val request = LoginRequest(phone, password)
                val response = apiService.login(request)
                
                if (response.isSuccessful && response.body() != null) {
                    val tokenResponse = response.body()!!
                    
                    // Save token
                    secureStorage.saveToken(tokenResponse.accessToken)
                    secureStorage.saveUserPhone(phone)
                    
                    // Check if OTP is required
                    if (tokenResponse.requiresOtp) {
                        val intent = Intent(this@LoginActivity, OtpActivity::class.java)
                        intent.putExtra("phone", phone)
                        startActivity(intent)
                    } else {
                        navigateToDashboard()
                    }
                } else {
                    val errorBody = response.errorBody()?.string()
                    Toast.makeText(
                        this@LoginActivity,
                        "Login failed: ${errorBody ?: "Unknown error"}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@LoginActivity,
                    "Network error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    private fun navigateToDashboard() {
        val intent = Intent(this, CardsListActivity::class.java)
        startActivity(intent)
        finish()
    }
    
    private fun getDeviceId(): String {
        return Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
    }
}

