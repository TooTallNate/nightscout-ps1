RED="$(tput setaf 1 2>/dev/null ||:)"
GREEN="$(tput setaf 2 2>/dev/null ||:)"
YELLOW="$(tput setaf 3 2>/dev/null ||:)"
NO_COLOR="$(tput sgr0 2>/dev/null ||:)"

nightscout_ps1() {
	eval "$(cat ~/.nightscout-ps1.env | sed 's/^/local /')"

	local trend="?"
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

	local color="${GREEN}"
	if [ "${latest_entry_mgdl}" -ge "${settings_thresholds_bg_target_top}" ]; then
		color="${YELLOW}"
	elif [ "${latest_entry_mgdl}" -le "${settings_thresholds_bg_target_bottom}" ]; then
		color="${RED}"
	fi

	printf "\001%s\002%03d %s\001%s\002" "${color}" "${latest_entry_mgdl}" "${trend}" "${NO_COLOR}"
}
