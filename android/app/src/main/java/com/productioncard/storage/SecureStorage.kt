package com.productioncard.storage

import android.content.Context
import android.content.SharedPreferences
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec
import android.util.Base64
import java.security.KeyStore
import javax.crypto.spec.IvParameterSpec

class SecureStorage(context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "production_card_prefs",
        Context.MODE_PRIVATE
    )
    
    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }
    
    private val keyAlias = "production_card_key"
    
    init {
        createKeyIfNeeded()
    }
    
    private fun createKeyIfNeeded() {
        if (!keyStore.containsAlias(keyAlias)) {
            val keyGenerator = KeyGenerator.getInstance("AES", "AndroidKeyStore")
            val keyGenParameterSpec = android.security.keystore.KeyGenParameterSpec.Builder(
                keyAlias,
                android.security.keystore.KeyGenParameterSpec.PURPOSE_ENCRYPT or
                android.security.keystore.KeyGenParameterSpec.PURPOSE_DECRYPT
            )
                .setBlockModes(android.security.keystore.KeyGenParameterSpec.BLOCK_MODE_GCM)
                .setEncryptionPaddings(android.security.keystore.KeyGenParameterSpec.ENCRYPTION_PADDING_NONE)
                .build()
            
            keyGenerator.init(keyGenParameterSpec)
            keyGenerator.generateKey()
        }
    }
    
    private fun getSecretKey(): SecretKey {
        return keyStore.getKey(keyAlias, null) as SecretKey
    }
    
    private fun encrypt(plaintext: String): String {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, getSecretKey())
        
        val iv = cipher.iv
        val encrypted = cipher.doFinal(plaintext.toByteArray())
        
        // Combine IV and encrypted data
        val combined = ByteArray(iv.size + encrypted.size)
        System.arraycopy(iv, 0, combined, 0, iv.size)
        System.arraycopy(encrypted, 0, combined, iv.size, encrypted.size)
        
        return Base64.encodeToString(combined, Base64.DEFAULT)
    }
    
    private fun decrypt(ciphertext: String): String {
        val combined = Base64.decode(ciphertext, Base64.DEFAULT)
        
        val iv = ByteArray(12) // GCM IV size
        System.arraycopy(combined, 0, iv, 0, iv.size)
        
        val encrypted = ByteArray(combined.size - iv.size)
        System.arraycopy(combined, iv.size, encrypted, 0, encrypted.size)
        
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val spec = IvParameterSpec(iv)
        cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), spec)
        
        return String(cipher.doFinal(encrypted))
    }
    
    fun saveToken(token: String) {
        try {
            val encrypted = encrypt(token)
            prefs.edit().putString("access_token", encrypted).apply()
        } catch (e: Exception) {
            // Fallback to plain text if encryption fails
            prefs.edit().putString("access_token", token).apply()
        }
    }
    
    fun getToken(): String? {
        val encrypted = prefs.getString("access_token", null) ?: return null
        return try {
            decrypt(encrypted)
        } catch (e: Exception) {
            // If decryption fails, try reading as plain text
            encrypted
        }
    }
    
    fun saveUserPhone(phone: String) {
        prefs.edit().putString("user_phone", phone).apply()
    }
    
    fun getUserPhone(): String? {
        return prefs.getString("user_phone", null)
    }
    
    fun clear() {
        prefs.edit().clear().apply()
    }
    
    fun saveDeviceHash(hash: String) {
        prefs.edit().putString("device_hash", hash).apply()
    }
    
    fun getDeviceHash(): String? {
        return prefs.getString("device_hash", null)
    }
}

