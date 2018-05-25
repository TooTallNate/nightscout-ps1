RED="$(tput setaf 1 2>/dev/null ||:)"
GREEN="$(tput setaf 2 2>/dev/null ||:)"
YELLOW="$(tput setaf 3 2>/dev/null ||:)"
NO_COLOR="$(tput sgr0 2>/dev/null ||:)"

nightscout_ps1() {
	#source ~/.n.env
	eval "$(cat ~/.n.env | sed 's/^/local /')"

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

	if [ "${latest_entry_mgdl}" -ge "${settings_thresholds_bg_target_top}" ]; then
		printf "\001${YELLOW}\002"
	elif [ "${latest_entry_mgdl}" -le "${settings_thresholds_bg_target_bottom}" ]; then
		printf "\001${RED}\002"
	else
		printf "\001${GREEN}\002"
	fi
	printf "%03d %s" "${latest_entry_mgdl}" "${trend}"
	printf "\001${NO_COLOR}\002"
}

nightscout_ps1
