package com.productioncard.models

import com.google.gson.annotations.SerializedName

data class ProductionCard(
    @SerializedName("id")
    val id: Int,
    
    @SerializedName("card_number")
    val cardNumber: String,
    
    @SerializedName("site_id")
    val siteId: Int,
    
    @SerializedName("assigned_to")
    val assignedTo: Int?,
    
    @SerializedName("status")
    val status: String, // "assigned", "submitted", "completed"
    
    @SerializedName("data")
    val data: Map<String, Any>?,
    
    @SerializedName("created_at")
    val createdAt: String,
    
    @SerializedName("updated_at")
    val updatedAt: String
)

