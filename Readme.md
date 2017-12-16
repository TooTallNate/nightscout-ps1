# nightscout-ps1

<img width="203" src="https://user-images.githubusercontent.com/71256/34065499-21048488-e1b7-11e7-985e-e2c08c3d3642.png">

Periodically syncs the latest entry from Nightscout to an eval-able file,
so that you can include your latest blood glucose entry in your terminal
prompt (also known as the `$PS1` variable).

The trend and target high/low values are also provided, so that you may
render arrows and colors as desired:

<img width="77" src="https://user-images.githubusercontent.com/71256/34065696-98696f46-e1b9-11e7-9e7e-b59386fc8bcf.png">

### Configure your `PS1`

The main key is to `eval` the `~/.bgl-cache` file, which looks something like:

```bash
local nightscout_ts="1513384967000"
local nightscout_bgl="104"
local nightscout_trend="Flat"
local nightscout_target_top="180"
local nightscout_target_bottom="80"
```

For example, in your `.bashrc`, `.profile`, or wherever you define your
`$PS1`, define a function similar to:

```bash
RED="$(tput setaf 1 2>/dev/null || echo '')"
GREEN="$(tput setaf 2 2>/dev/null || echo '')"
YELLOW="$(tput setaf 3 2>/dev/null || echo '')"
NO_COLOR="$(tput sgr0 2>/dev/null || echo '')"

function __ps1_bgl {
  eval "$(cat ~/.bgl-cache)"

  local trend="?"
  case "${nightscout_trend}" in
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
