package com.productioncard.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.productioncard.R
import com.productioncard.dashboard.CardsListActivity
import com.productioncard.models.OTPVerifyRequest
import com.productioncard.storage.SecureStorage
import com.productioncard.utils.ApiClient
import kotlinx.coroutines.launch

class OtpActivity : AppCompatActivity() {
    
    private lateinit var secureStorage: SecureStorage
    private lateinit var apiService: com.productioncard.services.ApiService
    private var phone: String = ""
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_otp)
        
        secureStorage = SecureStorage(this)
        apiService = ApiClient.getApiService()
        
        phone = intent.getStringExtra("phone") ?: ""
        
        if (phone.isEmpty()) {
            Toast.makeText(this, "Phone number not found", Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        
        setupVerifyButton()
    }
    
    private fun setupVerifyButton() {
        // Assuming you have EditText for OTP
        // val otpEditText = findViewById<EditText>(R.id.otpEditText)
        // val verifyButton = findViewById<Button>(R.id.verifyButton)
        // 
        // verifyButton.setOnClickListener {
        //     val otp = otpEditText.text.toString().trim()
        //     
        //     if (otp.length != 6) {
        //         Toast.makeText(this, "Please enter 6-digit OTP", Toast.LENGTH_SHORT).show()
        //         return@setOnClickListener
        //     }
        //     
        //     verifyOtp(otp)
        // }
    }
    
    private fun verifyOtp(otp: String) {
        lifecycleScope.launch {
            try {
                val request = OTPVerifyRequest(phone, otp)
                val response = apiService.verifyOtp(request)
                
                if (response.isSuccessful && response.body() != null) {
                    val tokenResponse = response.body()!!
                    
                    // Save token
                    secureStorage.saveToken(tokenResponse.accessToken)
                    secureStorage.saveUserPhone(phone)
                    
                    // Register device if needed
                    registerDevice()
                    
                    // Navigate to dashboard
                    val intent = Intent(this@OtpActivity, CardsListActivity::class.java)
                    startActivity(intent)
                    finish()
                } else {
                    val errorBody = response.errorBody()?.string()
                    Toast.makeText(
                        this@OtpActivity,
                        "OTP verification failed: ${errorBody ?: "Invalid OTP"}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@OtpActivity,
                    "Network error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    private fun registerDevice() {
        lifecycleScope.launch {
            try {
                val deviceHash = getDeviceHash()
                val token = secureStorage.getToken() ?: return@launch
                
                val response = apiService.registerDevice(
                    deviceHash,
                    "Bearer $token"
                )
                
                if (response.isSuccessful) {
                    secureStorage.saveDeviceHash(deviceHash)
                }
            } catch (e: Exception) {
                // Device registration failure is not critical
                e.printStackTrace()
            }
        }
    }
    
    private fun getDeviceHash(): String {
        // In a real implementation, you'd hash the Android ID
        // For now, using a simple approach
        val androidId = android.provider.Settings.Secure.getString(
            contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        )
        return androidId.hashCode().toString()
    }
}

