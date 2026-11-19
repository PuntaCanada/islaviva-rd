#!/usr/bin/env python3
"""Cache MET Norway forecasts for supported RD cities.
Attribution: Weather data from MET Norway (CC BY 4.0); not INDOMET alerts.
"""
import datetime as dt
import json
import pathlib
import urllib.error
import urllib.parse
import urllib.request

ROOT=pathlib.Path(__file__).resolve().parents[1]
CITIES={
    "Higüey":(18.6150,-68.7080),
    "Punta Cana":(18.5601,-68.3725),
    "Santo Domingo":(18.4861,-69.9312),
    "Santiago":(19.4517,-70.6970),
    "La Romana":(18.4273,-68.9728),
    "Puerto Plata":(19.7934,-70.6884),
    "Samaná":(19.2056,-69.3369),
}
target=ROOT/"data"/"weather.json"
prior={}
if target.exists():
    try: prior=json.loads(target.read_text(encoding="utf-8")).get("cities",{})
    except (ValueError,OSError): pass

result={}
now=dt.datetime.now(dt.timezone.utc)
for city,(lat,lon) in CITIES.items():
    url="https://api.met.no/weatherapi/locationforecast/2.0/compact?"+urllib.parse.urlencode({"lat":lat,"lon":lon})
    req=urllib.request.Request(url,headers={
        "User-Agent":"IslaVivaRD/1.0 (https://islaviva-rd.pages.dev; weather data attribution)",
        "Accept":"application/json",
    })
    try:
        with urllib.request.urlopen(req,timeout=25) as res:
            data=json.load(res)
        times=data["properties"]["timeseries"]
        # Forecast closest to current time, not a stale historical reading.
        current=next((v for v in times if dt.datetime.fromisoformat(v["time"].replace("Z","+00:00"))>=now-dt.timedelta(hours=2)),None)
        if current is None: raise ValueError("No current forecast")
        details=current["data"]["instant"]["details"]
        upcoming=current["data"].get("next_1_hours",{})
        symbol=upcoming.get("summary",{}).get("symbol_code","")
        result[city]={
            "temperature_c":round(float(details["air_temperature"]),1),
            "wind_mps":round(float(details.get("wind_speed",0)),1),
            "symbol":symbol,
            "forecast_for":current["time"],
            "updated":now.isoformat()
        }
        print(city, result[city]["temperature_c"])
    except (ValueError,KeyError,TypeError,urllib.error.URLError,TimeoutError) as exc:
        # Preserve a previous forecast ONLY if it is recent enough.
        previous=prior.get(city,{})
        try: age=now-dt.datetime.fromisoformat(previous["updated"].replace("Z","+00:00"))
        except (ValueError,KeyError,TypeError):age=dt.timedelta(days=99)
        if age<dt.timedelta(hours=6):result[city]=previous
        print(city,"unavailable",type(exc).__name__)
if result:
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps({"updated":now.isoformat(),"source":"MET Norway","license":"CC BY 4.0","cities":result},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
else:
    print("No forecast available; leaving snapshot unchanged.")
