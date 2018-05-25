BOLD="$(tput bold 2>/dev/null ||:)"
INVERSE="$(tput rev 2>/dev/null ||:)"
RED="$(tput setaf 1 2>/dev/null ||:)"
GREEN="$(tput setaf 2 2>/dev/null ||:)"
YELLOW="$(tput setaf 3 2>/dev/null ||:)"
NO_COLOR="$(tput sgr0 2>/dev/null ||:)"

SIX_MINUTES_MS=360000

nightscout_minutes_since() {
	echo "$((($(date +"%s") - ($1 / 1000)) / 60))"
}

nightscout_strikethrough() {
	sed "s/\(.\)/\1"$'\xcc\xb6'"/g"
}

nightscout_ps1() {
	eval "$(sed 's/^/local /' < ~/.nightscout-ps1.env)"
	local trend="?"
	local bgl="${latest_entry_mgdl}"
	local color="${GREEN}"
	local delta="$((${latest_entry_mgdl} - ${previous_entry_mgdl}))"
	local mins_ago="$(nightscout_minutes_since "${latest_entry_mills}")"

	if [ "${delta}" -ge 0 ]; then
		delta="+${delta}"
	fi

	# If the previous reading was more than 6 minutes ago (5 minutes is
	# normal, plus or minus some time to allow the reading to be uploaded
	if [ "$((${latest_entry_mills} - ${previous_entry_mills}))" -gt "${SIX_MINUTES_MS}" ]; then
		delta="${delta}*"
	fi

	if [ "${settings_alarm_timeago_urgent}" = "true" ] && [ "${mins_ago}" -gt "${settings_alarm_timeago_urgent_mins}" ]; then
		trend='↛'
		color="${INVERSE}${BOLD}${RED}"
		bgl="$(echo "${bgl}" | nightscout_strikethrough)"
		delta="$(echo "${delta}" | nightscout_strikethrough)"
	elif [ "${settings_alarm_timeago_warn}" = "true" ] && [ "${mins_ago}" -gt "${settings_alarm_timeago_warn_mins}" ]; then
		trend='↛'
		color="${INVERSE}${BOLD}${YELLOW}"
		bgl="$(echo "${bgl}" | nightscout_strikethrough)"
		delta="$(echo "${delta}" | nightscout_strikethrough)"
	else
		case "${latest_entry_direction}" in
			DoubleUp) trend="⇈";;
			SingleUp) trend="↑";;
			FortyFiveUp) trend="↗";;
			Flat) trend="→";;
			FortyFiveDown) trend="↘";;
			SingleDown) trend="↓";;
			DoubleDown) trend="⇊";;
			NONE) trend="⇼";;
		esac

		if [ "${latest_entry_mgdl}" -ge "${settings_thresholds_bg_high}" ]; then
			color="${BOLD}${YELLOW}"
		elif [ "${latest_entry_mgdl}" -ge "${settings_thresholds_bg_target_top}" ]; then
			color="${YELLOW}"
		elif [ "${latest_entry_mgdl}" -le "${settings_thresholds_bg_low}" ]; then
			color="${BOLD}${RED}"
		elif [ "${latest_entry_mgdl}" -le "${settings_thresholds_bg_target_bottom}" ]; then
			color="${RED}"
		fi
	fi

	printf "\001%s\002%d %s %s\001%s\002" \
		"${color}" "${bgl}" "${delta}" "${trend}" "${NO_COLOR}"
}
