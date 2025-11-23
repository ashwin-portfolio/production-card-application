package com.productioncard.models

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("message")
    val message: String? = null,
    
    @SerializedName("data")
    val data: T? = null,
    
    @SerializedName("error")
    val error: String? = null
)

data class TokenResponse(
    @SerializedName("access_token")
    val accessToken: String,
    
    @SerializedName("token_type")
    val tokenType: String,
    
    @SerializedName("user")
    val user: User,
    
    @SerializedName("requires_otp")
    val requiresOtp: Boolean = false
)

data class LoginRequest(
    @SerializedName("phone")
    val phone: String,
    
    @SerializedName("password")
    val password: String
)

data class OTPVerifyRequest(
    @SerializedName("phone")
    val phone: String,
    
    @SerializedName("otp")
    val otp: String
)

data class CardSubmissionRequest(
    @SerializedName("card_id")
    val cardId: Int,
    
    @SerializedName("latitude")
    val latitude: Double,
    
    @SerializedName("longitude")
    val longitude: Double,
    
    @SerializedName("data")
    val data: Map<String, Any>? = null
)

