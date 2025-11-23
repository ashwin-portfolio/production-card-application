package com.productioncard.models

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("id")
    val id: Int,
    
    @SerializedName("name")
    val name: String,
    
    @SerializedName("phone")
    val phone: String,
    
    @SerializedName("role")
    val role: String, // "admin" or "employee"
    
    @SerializedName("site_id")
    val siteId: Int?,
    
    @SerializedName("language")
    val language: String,
    
    @SerializedName("device_hash")
    val deviceHash: String?,
    
    @SerializedName("created_at")
    val createdAt: String
)

