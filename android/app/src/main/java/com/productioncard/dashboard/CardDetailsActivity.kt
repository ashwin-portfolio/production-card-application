package com.productioncard.dashboard

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import com.productioncard.R
import com.productioncard.models.CardSubmissionRequest
import com.productioncard.services.LocationService
import com.productioncard.storage.SecureStorage
import com.productioncard.utils.ApiClient
import kotlinx.coroutines.launch

class CardDetailsActivity : AppCompatActivity() {
    
    private lateinit var secureStorage: SecureStorage
    private lateinit var apiService: com.productioncard.services.ApiService
    private lateinit var locationService: LocationService
    private var cardId: Int = -1
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_card_details)
        
        secureStorage = SecureStorage(this)
        apiService = ApiClient.getApiService()
        locationService = LocationService(this)
        
        cardId = intent.getIntExtra("card_id", -1)
        if (cardId == -1) {
            Toast.makeText(this, "Invalid card", Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        
        loadCardDetails()
        setupSubmitButton()
    }
    
    private fun loadCardDetails() {
        lifecycleScope.launch {
            try {
                val token = secureStorage.getToken() ?: return@launch
                val response = apiService.getCardDetails(cardId, "Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    val card = response.body()!!
                    // Update UI with card details
                    // updateCardUI(card)
                } else {
                    Toast.makeText(
                        this@CardDetailsActivity,
                        "Failed to load card details",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@CardDetailsActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
    
    private fun setupSubmitButton() {
        // val submitButton = findViewById<Button>(R.id.submitButton)
        // submitButton.setOnClickListener {
        //     submitCard()
        // }
    }
    
    private fun submitCard() {
        // Check location permission
        if (!locationService.hasLocationPermission()) {
            Toast.makeText(
                this,
                "Location permission is required",
                Toast.LENGTH_LONG
            ).show()
            requestLocationPermission()
            return
        }
        
        lifecycleScope.launch {
            try {
                // Get current location
                val location = locationService.getCurrentLocation()
                
                if (location == null) {
                    Toast.makeText(
                        this@CardDetailsActivity,
                        "Unable to get location. Please try again.",
                        Toast.LENGTH_LONG
                    ).show()
                    return@launch
                }
                
                val token = secureStorage.getToken() ?: return@launch
                val request = CardSubmissionRequest(
                    cardId = cardId,
                    latitude = location.latitude,
                    longitude = location.longitude,
                    data = null
                )
                
                val response = apiService.submitCard(cardId, request, "Bearer $token")
                
                if (response.isSuccessful) {
                    Toast.makeText(
                        this@CardDetailsActivity,
                        "Card submitted successfully",
                        Toast.LENGTH_SHORT
                    ).show()
                    finish()
                } else {
                    val errorBody = response.errorBody()?.string()
                    Toast.makeText(
                        this@CardDetailsActivity,
                        "Submission failed: ${errorBody ?: "Unknown error"}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@CardDetailsActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    private fun requestLocationPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ),
            LOCATION_PERMISSION_REQUEST_CODE
        )
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                submitCard()
            } else {
                Toast.makeText(
                    this,
                    "Location permission is required to submit cards",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    companion object {
        private const val LOCATION_PERMISSION_REQUEST_CODE = 1002
    }
}

