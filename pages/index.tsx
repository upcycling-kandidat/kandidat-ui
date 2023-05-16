import Image from "next/image";
import { FormEvent, SyntheticEvent, useEffect, useState } from "react";

type UploadedImageType = {
  bucket: string;
  input_file: string;
  output_file: string;
};

type PredictionType = {
  colors: string[];
  defects: UploadedImageType;
  dimensions: UploadedImageType & {
    predicted_height: number;
    predicted_width: number;
  };
  materials: string;
  transparent: UploadedImageType;
};

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [results, setResults] = useState<PredictionType[]>([]);

  const handleImageChange = (event: FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const fileList = target.files ? Array.from(target.files) : [];

    setImages(fileList);
  };

  const handleOnSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    if (images.length < 1) return;
    images.forEach((img) => {
      formData.append("file", img, img.name);
    });

    const res = await fetch(form.action, {
      method: form.method,
      body: formData,
    });
    const data = await res.json();

    setResults(data);
  };

  useEffect(() => {
    if (images.length < 1) return;
    const newImageUrls: string[] = [];
    images.forEach((img) => {
      newImageUrls.push(URL.createObjectURL(img));
    });
    setImageUrls(newImageUrls);
  }, [images]);

  return (
    <div className="max-w-8xl p-5 mx-auto">
      <h1 className="text-7xl mt-20 font-bold">kandidat-ui</h1>

      <form
        action="http://localhost:5000/predict"
        method="POST"
        onSubmit={handleOnSubmit}
      >
        <div className="pt-10">
          <input
            className="file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-teal-50 file:text-teal-700
              hover:file:bg-teal-100"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="flex gap-6 my-10 px-10 bg-stone-900 rounded-md">
          {imageUrls.map((imgUrl, index) => {
            return (
              <div key={`${imgUrl}-${index}`} className="my-10">
                <Image src={imgUrl} alt="image" width={200} height={200} />
              </div>
            );
          })}
        </div>
        <button
          className="py-2 px-4 rounded-lg border transition-all duration-150 bg-teal-50 text-teal-700 hover:bg-teal-100"
          type="submit"
        >
          Upload
        </button>
      </form>

      <h2 className="text-7xl font-bold mt-5">results</h2>

      <div className="flex gap-6 my-10 px-10 bg-stone-900 rounded-md">
        {results.map((result, index) => {
          return (
            <div key={`${result}-${index}`} className="m-5">
              <h2 className="text-xl mt-4">
                Material:{" "}
                <span className="text-sm border px-5 py-1 rounded-full">
                  {result.materials}
                </span>
              </h2>

              <h2 className="text-xl mt-4">
                Dimensions:{" "}
                <span className="text-sm border px-5 py-1 rounded-full">
                  Width: {result.dimensions.predicted_width} cm
                </span>
                <span className="text-sm border px-5 py-1 rounded-full ml-2">
                  Height: {result.dimensions.predicted_height} cm
                </span>
              </h2>

              <h2 className="text-xl mt-4 flex">
                Colors:{" "}
                {result.colors.map((color, index) => (
                  <span
                    key={`${color}-${index}`}
                    style={{ backgroundColor: color }}
                    className={`block w-8 h-8 rounded ml-3`}
                  ></span>
                ))}
              </h2>

              <div className="bg-stone-800 p-4 rounded mt-10">
                <p className="p-0">Prediction:</p>
                <Image
                  src={`http://localhost:9000/${result.defects.bucket}/${result.defects.output_file}`}
                  alt="image"
                  width={400}
                  height={400}
                />
              </div>

              <div className="bg-stone-800 p-2 mt-4">
                <p className="p-0">Dimension:</p>
                <Image
                  src={`http://localhost:9000/${result.dimensions.bucket}/${result.dimensions.output_file}`}
                  alt="image"
                  width={400}
                  height={400}
                />
              </div>

              <div className="bg-stone-800 p-2 mt-4">
                <p className="p-0">Transparent:</p>
                <Image
                  src={`http://localhost:9000/${result.transparent.bucket}/${result.transparent.output_file}`}
                  alt="image"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
