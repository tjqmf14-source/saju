package kr.naesaju.personal.data.profile

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

private val Context.profileDataStore by preferencesDataStore(name = "sajutaro_profile")

class ProfileStore(private val context: Context) {
    suspend fun load(): UserProfile? {
        val preferences = context.profileDataStore.data.first()
        val birthDate = preferences[Keys.BirthDate] ?: return null
        return UserProfile(
            name = preferences[Keys.Name].orEmpty().ifBlank { "사용자" },
            calendar = preferences[Keys.Calendar] ?: "solar",
            birthDate = birthDate,
            birthTime = preferences[Keys.BirthTime] ?: "12:00",
            birthTimeKnown = preferences[Keys.BirthTimeKnown] ?: true,
            gender = preferences[Keys.Gender] ?: "male",
            isLeap = preferences[Keys.IsLeap] ?: false
        )
    }

    suspend fun save(profile: UserProfile) {
        context.profileDataStore.edit { preferences ->
            preferences[Keys.Name] = profile.name.trim().ifBlank { "사용자" }
            preferences[Keys.Calendar] = profile.calendar
            preferences[Keys.BirthDate] = profile.birthDate
            preferences[Keys.BirthTime] = profile.birthTime
            preferences[Keys.BirthTimeKnown] = profile.birthTimeKnown
            preferences[Keys.Gender] = profile.gender
            preferences[Keys.IsLeap] = profile.calendar == "lunar" && profile.isLeap
        }
    }

    private object Keys {
        val Name = stringPreferencesKey("name")
        val Calendar = stringPreferencesKey("calendar")
        val BirthDate = stringPreferencesKey("birth_date")
        val BirthTime = stringPreferencesKey("birth_time")
        val BirthTimeKnown = booleanPreferencesKey("birth_time_known")
        val Gender = stringPreferencesKey("gender")
        val IsLeap = booleanPreferencesKey("is_leap")
    }
}
