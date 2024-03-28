import { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log(formData);
  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");
      setLoading(true);
      setError(false);
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-900 my-7">
        Create a Listing
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        <div className="flex flex-col gap-4 flex-1 px-4 py-6 bg-gray-100 rounded-lg shadow-lg">
          <input
            type="text"
            placeholder="Name"
            className="border-2 border-blue-500 p-4 rounded-xl focus:outline-none focus:border-blue-700"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border border-blue-500 p-4 rounded-lg shadow-md focus:outline-none focus:border-blue-700"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />

          <input
            type="text"
            placeholder="Address"
            className="border border-green-500 p-4 rounded-lg shadow-md focus:outline-none focus:border-green-700"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="sale"
                className="w-5 h-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <label htmlFor="sale" className="text-gray-800 font-medium">
                Sell
              </label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="rent"
                className="w-5 h-5 text-indigo-600"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <label htmlFor="rent" className="text-gray-800 font-medium">
                Rent
              </label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="parking"
                className="w-5 h-5 text-green-600"
                onChange={handleChange}
                checked={formData.parking}
              />
              <label htmlFor="parking" className="text-gray-800 font-medium">
                Parking spot
              </label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="furnished"
                className="w-5 h-5 text-blue-600"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <label htmlFor="furnished" className="text-gray-800 font-medium">
                Furnished
              </label>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="offer"
                className="w-5 h-5 text-green-600"
                onChange={handleChange}
                checked={formData.offer}
              />
              <label htmlFor="offer" className="text-gray-800 font-medium">
                Offer
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p className="text-sm text-gray-500">Number of Bedrooms</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p className="text-sm text-gray-500">Number of Bathrooms</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
                placeholder="Regular Price"
              />

              <div className="flex flex-col items-center">
                <p className="text-lg font-semibold text-gray-800">Price</p>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="regularPrice"
                    min="50"
                    max="10000000"
                    required
                    className="p-3 border border-gray-300 rounded-lg mr-4"
                    onChange={handleChange}
                    value={formData.regularPrice}
                    placeholder="Regular Price"
                  />
                  {formData.type === "rent" && (
                    <span className="text-xs text-gray-500">(RS / month)</span>
                  )}
                </div>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <label htmlFor="discountPrice" className="mr-2">
                    Discounted Price:
                  </label>
                  <input
                    type="number"
                    id="discountPrice"
                    min="0"
                    max="10000000"
                    required
                    className="p-3 border border-gray-300 rounded-lg"
                    onChange={handleChange}
                    value={formData.discountPrice}
                  />
                  {formData.type === "rent" && (
                    <span className="text-xs">(RS / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-bold text-lg text-blue-900">
            Images:
            <span className="font-normal text-gray-500 ml-2">
              (Note: The first image will be the cover and you can upload up to
              6 images.)
            </span>
          </p>

          <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4">
            <label htmlFor="images" className="relative cursor-pointer">
              <input
                onChange={(e) => setFiles(e.target.files)}
                className="hidden"
                type="file"
                id="images"
                accept="image/*"
                multiple
              />
              <div className="bg-blue-500 text-white py-3 px-4 rounded-lg uppercase text-center font-semibold hover:bg-blue-600 transition duration-300">
                Choose Images
              </div>
            </label>
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className={`py-3 px-4 border rounded-lg uppercase font-semibold ${
                uploading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600 transition duration-300"
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                >
                  Delete
                </button>
              </div>
            ))}

          <button
            disabled={loading || uploading}
            className={`py-3 px-6 bg-blue-500 text-white rounded-lg uppercase font-semibold hover:bg-blue-600 transition duration-300 ${
              loading || uploading ? "cursor-not-allowed opacity-80" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>

          {error && (
            <p className="text-red-700 text-sm bg-red-100 border border-red-400 py-2 px-4 rounded-md">
              {error}
            </p>
          )}
        </div>
      </form>
    </main>
  );
}
