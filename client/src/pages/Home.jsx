import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css/bundle";
import ListingItem from "../components/ListingItem";

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const offerRes = await fetch("/api/listing/get?offer=true&limit=4");
        const offerData = await offerRes.json();
        setOfferListings(offerData);

        const rentRes = await fetch("/api/listing/get?type=rent&limit=4");
        const rentData = await rentRes.json();
        setRentListings(rentData);

        const saleRes = await fetch("/api/listing/get?type=sale&limit=4");
        const saleData = await saleRes.json();
        setSaleListings(saleData);

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleRefresh = () => {
    fetchListings();
  };

  return (
    <div>
      <div className="flex flex-col gap-8 p-10 md:p-20 max-w-6xl mx-auto">
        <h1 className="text-teal-700 font-bold text-3xl lg:text-6xl">
          Discover your next <span className="text-indigo-700">dream</span>
          <br />
          home with ease
        </h1>

        <div className="text-blue-600 text-sm sm:text-base">
          Welcome to Modern-Estate, your trusted destination for finding your
          ideal home.
          <br />
          Explore our diverse selection of properties tailored to your needs.
        </div>
        <Link
          to={"/search"}
          className="text-base sm:text-lg text-teal-600 font-semibold hover:text-teal-800 hover:underline"
        >
          Start your search now
        </Link>
      </div>
      <Swiper navigation className="w-full">
        {offerListings &&
          offerListings.length > 0 &&
          offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                style={{
                  backgroundImage: `url(${listing.imageUrls[0]})`,
                }}
                className="h-[500px] bg-cover bg-center"
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>
      <div className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col gap-8 my-10">
        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">Error: {error}</div>
        ) : (
          <React.Fragment>
            {offerListings && offerListings.length > 0 && (
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="my-3">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Recent offers
                  </h2>
                  <Link
                    className="text-sm text-blue-800 hover:underline"
                    to={"/search?offer=true"}
                  >
                    Show more offers
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offerListings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))}
                </div>
              </div>
            )}
            {rentListings && rentListings.length > 0 && (
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="my-3">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Recent places for rent
                  </h2>
                  <Link
                    className="text-sm text-blue-800 hover:underline"
                    to={"/search?type=rent"}
                  >
                    Show more places for rent
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rentListings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))}
                </div>
              </div>
            )}
            {saleListings && saleListings.length > 0 && (
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="my-3">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Recent places for sale
                  </h2>
                  <Link
                    className="text-sm text-blue-800 hover:underline"
                    to={"/search?type=sale"}
                  >
                    Show more places for sale
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {saleListings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))}
                </div>
              </div>
            )}
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              onClick={handleRefresh}
            >
              Refresh Listings
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
