# nightscout-ps1

<img width="116" alt="screen shot 2017-12-15 at 4 19 51 pm" src="https://user-images.githubusercontent.com/71256/34065482-e4ed2432-e1b6-11e7-9562-9f9bb8b7eed3.png">

Periodically syncs the latest entry from Nightscout to an eval-able file.

This allows you to source the file in your `$PS1` variable and include
your latest blood glucose entry in your terminal prompt.

### Configure your `PS1`

The main key is to `eval` the `~/.bgl-cache` file.

For example, in your `.bashrc`, `.profile`, or wherever you define your
`$PS1`, define a function similar to:

```bash
RED="$(tput setaf 1 2>/dev/null || echo '')"
GREEN="$(tput setaf 2 2>/dev/null || echo '')"
YELLOW="$(tput setaf 3 2>/dev/null || echo '')"
NO_COLOR="$(tput sgr0 2>/dev/null || echo '')"

function __ps1_bgl {
  eval "$(cat ~/.bgl-cache)"

  local trend="$nightscout_trend"
  case "${trend}" in
    DoubleUp) trend="⇈";;
    SingleUp) trend="↑";;
    FortyFiveUp) trend="↗";;
    Flat) trend="→";;
    FortyFiveDown) trend="↘";;
    SingleDown) trend="↓";;
    DoubleDown) trend="⇊";;
  esac

  if [ "${nightscout_bgl}" -ge "${nightscout_target_top}" ]; then
    printf "\001${YELLOW}\002"
  elif [ "${nightscout_bgl}" -le "${nightscout_target_bottom}" ]; then
    printf "\001${RED}\002"
  else
    printf "\001${GREEN}\002"
  fi
  printf "%03d %s" "${nightscout_bgl}" "${trend}"
  printf "\001${NO_COLOR}\002"
}

export PS1="\$(__ps1_bgl) $ "
```

Restart your shell session, or `source` the file again to see the changes
in effect.


### Setup on MacOS

```bash
cp service/io.n8.nightscout-ps1.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/io.n8.nightscout-ps1.plist
```


### Setup on Linux

Use a cronjob via `crontab` (TODO: add real docs)


### Setup on Windows

TODO: add real docs
