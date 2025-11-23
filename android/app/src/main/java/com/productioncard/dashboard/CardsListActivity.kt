package com.productioncard.dashboard

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.productioncard.R
import com.productioncard.models.ProductionCard
import com.productioncard.storage.SecureStorage
import com.productioncard.utils.ApiClient
import kotlinx.coroutines.launch

class CardsListActivity : AppCompatActivity() {
    
    private lateinit var secureStorage: SecureStorage
    private lateinit var apiService: com.productioncard.services.ApiService
    private lateinit var recyclerView: RecyclerView
    private var cardsList: List<ProductionCard> = emptyList()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cards_list)
        
        secureStorage = SecureStorage(this)
        apiService = ApiClient.getApiService()
        
        // Check if logged in
        val token = secureStorage.getToken()
        if (token == null) {
            // Redirect to login
            finish()
            return
        }
        
        setupRecyclerView()
        requestLocationPermission()
        loadCards()
    }
    
    private fun setupRecyclerView() {
        // recyclerView = findViewById<RecyclerView>(R.id.cardsRecyclerView)
        // recyclerView.layoutManager = LinearLayoutManager(this)
        // recyclerView.adapter = CardsAdapter(cardsList) { card ->
        //     openCardDetails(card)
        // }
    }
    
    private fun loadCards() {
        lifecycleScope.launch {
            try {
                val token = secureStorage.getToken() ?: return@launch
                val response = apiService.getMyCards("Bearer $token")
                
                if (response.isSuccessful && response.body() != null) {
                    cardsList = response.body()!!
                    // Update adapter
                    // recyclerView.adapter?.notifyDataSetChanged()
                } else {
                    Toast.makeText(
                        this@CardsListActivity,
                        "Failed to load cards",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@CardsListActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
    
    private fun openCardDetails(card: ProductionCard) {
        val intent = Intent(this, CardDetailsActivity::class.java)
        intent.putExtra("card_id", card.id)
        startActivity(intent)
    }
    
    private fun requestLocationPermission() {
        if (ContextCompat.checkSelfPermission(
                this,
                android.Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(android.Manifest.permission.ACCESS_FINE_LOCATION),
                LOCATION_PERMISSION_REQUEST_CODE
            )
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "Location permission granted", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(
                    this,
                    "Location permission is required for card submission",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    companion object {
        private const val LOCATION_PERMISSION_REQUEST_CODE = 1001
    }
}

