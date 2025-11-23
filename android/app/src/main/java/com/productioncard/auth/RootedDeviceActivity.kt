package com.productioncard.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.productioncard.R

class RootedDeviceActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_rooted_device)
        
        // This activity shows a warning that the device is rooted
        // and blocks access to the app
        
        // Assuming you have a close button
        // val closeButton = findViewById<Button>(R.id.closeButton)
        // closeButton.setOnClickListener {
        //     finishAffinity() // Close the app
        // }
    }
    
    override fun onBackPressed() {
        // Prevent going back
        finishAffinity()
    }
}

