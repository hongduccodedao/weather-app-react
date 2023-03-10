import React from "react";
import useSWR from "swr";
import { fetcher, api_key } from "../configs/apiConfig";
import { BsCloudRain, BsSearch } from "react-icons/bs";
import { useDebounce } from "../hooks/useDebounce";

import Rain from "../assets/images/rain.jpg";
import Imagebg from "../components/Imagebg";
import WeatherIcon from "../components/WeatherIcon";
import Forecast from "../components/Forecast";

const HomePage = () => {
   const [searchData, setSearchData] = React.useState("");
   const [search, setSearch] = React.useState("");

   // lấy vị trí hiện tại của người dùng
   const [lat, setLat] = React.useState(21.0278);
   const [lon, setLon] = React.useState(105.8342);

   const filterSearch = useDebounce(searchData, 2000);

   // nếu ô search rỗng thì lấy vị trí hiện tại

   React.useEffect(() => {
      if (searchData == "") {
         navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setLat(latitude);
            setLon(longitude);
         });
      }
   }, [searchData]);

   const time = new Date();

   const { data, error, isLoading } = useSWR(
      `https://api.openweathermap.org/data/2.5/weather?q=${filterSearch}&lat=${lat}&lon=${lon}&appid=${api_key}&units=metric&lang=vi`,
      fetcher
   );

   // lấy dữ liệu từ ô search
   const handlerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchData(e.target.value);
   };

   // lấy dữ liệu của 4 ngày tiếp theo

   const [lat4day, setLat4day] = React.useState("");
   const [lon4day, setLon4day] = React.useState("");

   React.useEffect(() => {
      if (data?.cod == "404") {
         setLat4day("");
         setLon4day("");
      } else {
         setLat4day(data?.coord?.lat);
         setLon4day(data?.coord?.lon);
      }
   }, [data]);

   const {
      data: data4day,
      error: error4day,
      isLoading: isLoading4day,
   } = useSWR(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat4day}&lon=${lon4day}&exclude=current,minutely,hourly,alerts&appid=${api_key}&units=metric&lang=vi`,
      fetcher
   );

   return (
      <div className="w-screen h-screen relative bg-slate-800">
         {isLoading ? (
            <div className="w-full h-full flex justify-center items-center">
               <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
         ) : (
            <>
               <a href="/" className="">
                  <div className="absolute top-[10vh] left-[10vw] flex items-center gap-2">
                     <BsCloudRain className="text-4xl text-white" />
                     <h1 className="text-white text-2xl font-semibold">
                        Weather App
                     </h1>
                  </div>
               </a>

               {data?.cod == "404" ? (
                  <img
                     src={Rain}
                     alt="weather"
                     className="w-full h-full bg-cover pointer-events-none bg-no-repeat bg-center"
                  />
               ) : (
                  <Imagebg weather={data ? data?.weather[0]?.main : "Clear"} />
               )}

               <div className="absolute left-[10vw] bottom-[10vh] flex items-center gap-4">
                  {data?.cod == "404" ? (
                     <div className="text-white text-2xl">
                        Không tìm thấy thành phố
                     </div>
                  ) : (
                     <>
                        <h1 className="text-8xl text-white font-semibold">
                           {Math.round(data?.main?.temp)}
                           <span className="align-top text-4xl">o</span>
                        </h1>
                        <div className="text-white">
                           <h2 className="font-medium text-5xl">
                              {data?.name}
                           </h2>
                           <h4 className="text-sm">
                              {/* 06:00 PM - Sunday, 5 Oct 22 */}
                              {time.toLocaleTimeString()} -{" "}
                              {time.toDateString()}
                           </h4>
                        </div>
                        <div className="text-white">
                           <div className="text-5xl">
                              <WeatherIcon
                                 weather={
                                    data ? data?.weather[0]?.main : "Clear"
                                 }
                              />
                           </div>
                           <span className="font-medium">
                              {data ? data?.weather[0]?.main : "Clear"}
                           </span>
                        </div>
                     </>
                  )}
               </div>

               <div className="absolute top-0 right-0 w-[30vw] h-screen glass-effect">
                  <div className="flex items-center h-[70px]">
                     <div className="px-6 search-input h-full">
                        <input
                           type="text"
                           className="h-full w-full bg-transparent border-b-2 text-white placeholder:text-white outline-none"
                           placeholder="Anothor weather"
                           onChange={handlerSearch}
                        />
                     </div>
                     <button className="bg-slate-500 h-full w-[70px] flex items-center justify-center">
                        <BsSearch className="text-2xl text-white" />
                     </button>
                  </div>

                  <div className="p-6">
                     <div className="text-white border-b-2 py-6">
                        <h2 className="font-semibold">Weather Details</h2>
                        <div className="flex flex-col gap-5 mt-5">
                           <div className="flex items-center justify-between">
                              <span className="">Cloudy</span>
                              <span className="">
                                 {!data ? 0 : data?.clouds?.all}%
                              </span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="">Humidity</span>
                              <span className="">
                                 {!data ? 0 : data?.main?.humidity}%
                              </span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="">Wind</span>
                              <span className="">
                                 {!data ? 0 : data?.wind?.speed} km/h
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="p-6">
                     <div className="text-white border-b-2 py-6">
                        <h2 className="font-semibold">Next Days</h2>
                        {data?.cod == "404" || data4day?.cod == "404" || data4day?.cod == "400" ? (
                           <div className="text-white text-2xl">
                              Không có dữ liệu
                           </div>
                        ) : (
                           <div className="flex flex-col gap-5 mt-5">
                              {data4day?.daily?.map(
                                 (item: any, index: number) => {
                                    return <Forecast key={index} item={item} />;
                                 }
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </>
         )}
      </div>
   );
};

export default HomePage;
