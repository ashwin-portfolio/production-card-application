package com.productioncard.services

import com.productioncard.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // Authentication
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<TokenResponse>
    
    @POST("api/auth/verify-otp")
    suspend fun verifyOtp(@Body request: OTPVerifyRequest): Response<TokenResponse>
    
    @POST("api/auth/refresh")
    suspend fun refreshToken(@Header("Authorization") token: String): Response<TokenResponse>
    
    // Production Cards
    @GET("api/cards/my")
    suspend fun getMyCards(@Header("Authorization") token: String): Response<List<ProductionCard>>
    
    @GET("api/cards/{id}")
    suspend fun getCardDetails(
        @Path("id") cardId: Int,
        @Header("Authorization") token: String
    ): Response<ProductionCard>
    
    @POST("api/cards/{id}/submit")
    suspend fun submitCard(
        @Path("id") cardId: Int,
        @Body request: CardSubmissionRequest,
        @Header("Authorization") token: String
    ): Response<ApiResponse<Any>>
    
    // Device Management
    @POST("api/devices/register")
    @FormUrlEncoded
    suspend fun registerDevice(
        @Field("device_hash") deviceHash: String,
        @Header("Authorization") token: String
    ): Response<ApiResponse<Any>>
}

