import React, { useEffect, useState, useRef } from "react";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import axios from "axios";
import { lastXMinutes } from "./utils";

const API_KEY: string = process.env.REACT_APP_GOOGLE_API_KEY!;

const Map = () => {
  const render = (status: Status) => <h1>{status}</h1>;
  return (
    <Wrapper apiKey={API_KEY} render={render}>
      <MapComponent />
    </Wrapper>
  );
};

type activity = {
  bearing: number;
  blockRef: string;
  destinationName: string;
  destinationRef: string;
  directionRef: string;
  itemIdentifier: string;
  latitude: string;
  longitude: string;
  operatorRef: string;
  originName: string;
  originRef: string;
  publishedLineName: string;
  recordedAtTime: string;
  validUntilTime: string;
  vehicleRef: string;
};

const MapComponent = () => {
  const [map, setMap] = useState<google.maps.Map>();
  const ref = useRef<HTMLDivElement>();

  const [inputLatLng, setInputLatLng] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });

  const [markerCluster, setMarkerCluster] = useState<MarkerClusterer>();
  const [marker, setMarker] = useState<
    { lat: number; lng: number } | undefined
  >();

  useEffect(() => {
    console.log("running inital useeffect");
  }, []);

  useEffect(() => {
    // If target div with ref rendered and no map state yet, call google to set map
    if (ref.current && !map) {
      setMap(
        new window.google.maps.Map(ref.current, {
          center: { lat: 50.92865, lng: -1.78847 },
          zoom: 11,
        })
      );
    }

    // adds map click listener to set marker, also sets new empty markercluster,
    // provided there is not already a marker cluster and map
    if (map && !markerCluster) {
      // map.addListener('click', (e: google.maps.MapMouseEvent) => {
      //   if (e.latLng) {
      //     const {lat, lng} = e.latLng
      //     setMarker({lat: lat(), lng: lng()})
      //   }
      // })
      setMarkerCluster(new MarkerClusterer({ map, markers: [] }));
    }
    const fetchAndPlotBusLocations = (): void => {
      axios
        .get("http://localhost:8080/api/v1/activity", {
          params: {
            direction: "OUTBOUND",
            since: lastXMinutes(10),
            route: "X3",
          },
        })
        .then((res) => {
          const activities: activity[] = res.data;
          activities.forEach((activity) => {
            if (markerCluster) {
              markerCluster.addMarker(
                new window.google.maps.Marker({
                  position: {
                    lat: parseFloat(activity.latitude),
                    lng: parseFloat(activity.longitude),
                  },
                })
              );
            }
          });
        });
    };

    if (map && markerCluster) {
      fetchAndPlotBusLocations();
    }
  }, [map, markerCluster]);

  // when marker state changes, add this new marker to the cluster
  useEffect(() => {
    if (marker && markerCluster) {
      markerCluster.addMarker(
        new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
        })
      );
    }
  }, [marker, markerCluster]);

  const handleAddClick = (): void => {
    // add logic to set lat and lng inpput fields as markers
    setMarker(inputLatLng);
  };

  const handleInputLatLngChange = (latOrLng: string, value: number): void => {
    switch (latOrLng) {
      case "lat":
        setInputLatLng({ ...inputLatLng, lat: value });
        break;
      case "lng":
        setInputLatLng({ ...inputLatLng, lng: value });
        break;
    }
  };

  return (
    <>
      <div
        ref={ref as any}
        style={{ height: "90vh", width: "100vw", minHeight: "90vh" }}
      ></div>
      Lat:{" "}
      <input
        value={inputLatLng?.lat}
        onChange={(e) =>
          handleInputLatLngChange("lat", parseFloat(e.target.value))
        }
      />{" "}
      &nbsp; Lng:{" "}
      <input
        value={inputLatLng?.lng}
        onChange={(e) =>
          handleInputLatLngChange("lng", parseFloat(e.target.value))
        }
      />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={handleAddClick}>Add</button>
    </>
  );
};

export default Map;
