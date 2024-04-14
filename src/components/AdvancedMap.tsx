import React, { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  Pin,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import axios from "axios";
import { lastXMinutes } from "./utils";

const API_KEY: string = process.env.REACT_APP_GOOGLE_API_KEY!;

const beachFlagImg = document.createElement("img");
beachFlagImg.src =
  "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

const center = { lat: 50.92865, lng: -1.78847 };

const xMins = 8;

type activityRecord = {
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

const AdvancedMap = () => {
  const position = { lat: 53.54992, lng: 10.00678 };

  const [busData, setBusData] = useState<activityRecord[]>([]);

  useEffect(() => {
    fetchAndPlotBusLocations();
    const interval = setInterval(() => {
      fetchAndPlotBusLocations();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchAndPlotBusLocations = (): void => {
    axios
      .get("http://localhost:8080/api/v1/activity", {
        params: {
          //   direction: "OUTBOUND",
          since: lastXMinutes(xMins),
          route: "X3",
        },
      })
      .then((res) => {
        setBusData(res.data);
      });
  };

  const calculateOpacity = (recordedAtTime): number => {
    const d = new Date(recordedAtTime);
    const diffTime = Math.abs(d.valueOf() - Date.now().valueOf());
    return (xMins * 60 * 1000 - diffTime) / (xMins * 60 * 1000);
  };

  const renderBuses = () => {
    if (busData.length > 0) {
      const op = calculateOpacity(busData[0].recordedAtTime);
      console.log(op);
    }

    // console.log(calculateOpacity(busData[0].recordedAtTime));
    return busData.map((busRecord) => {
      return (
        <AdvancedMarker
          position={{
            lat: parseFloat(busRecord.latitude),
            lng: parseFloat(busRecord.longitude),
          }}
          title={"AdvancedMarker with custom html content."}
        >
          <div
            style={{
              width: 30,
              height: 13,
              position: "absolute",
              top: 0,
              left: 0,
              background: "red",
              border: "2px solid black",
              borderRadius: "15%",
              opacity: `${calculateOpacity(busRecord.recordedAtTime) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${
                -90 + busRecord.bearing
              }deg)`,
            }}
          >
            {"--->"}
          </div>
        </AdvancedMarker>
      );
    });
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        mapId={"bf51a910020fa25a"}
        defaultCenter={center}
        defaultZoom={13}
        style={{ height: "90vh", width: "100vw", minHeight: "90vh" }}
      >
        {renderBuses()}
      </Map>
    </APIProvider>
  );
};

export default AdvancedMap;
