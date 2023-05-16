import Image from "next/image";
import {
  FormEvent,
  Fragment,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";

type PredictionType = {
  components: string[];
  defects: string[];
  materials: string[];
  dimensions: { predicted_height: number; predicted_width: number }[];
  transparent: string[];
  colors: string[][];
};

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [results, setResults] = useState<PredictionType>();

  const IMAGE_URL = "https://backend.adamnor.com/";

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

    const [
      resComponents,
      resDefects,
      resMaterials,
      resDimensions,
      resTransparent,
      resColors,
    ] = await Promise.all([
      fetch("https://backend.adamnor.com/components", {
        method: form.method,
        body: formData,
      }),

      fetch("https://backend.adamnor.com/defects", {
        method: form.method,
        body: formData,
      }),

      fetch("https://backend.adamnor.com/materials", {
        method: form.method,
        body: formData,
      }),

      fetch("https://backend.adamnor.com/dimensions", {
        method: form.method,
        body: formData,
      }),

      fetch("https://backend.adamnor.com/transparent", {
        method: form.method,
        body: formData,
      }),

      fetch("https://backend.adamnor.com/colors", {
        method: form.method,
        body: formData,
      }),
    ]).then((responses) =>
      Promise.all(responses.map((response) => response.json()))
    );

    const data = {
      components: resComponents,
      defects: resDefects,
      materials: resMaterials,
      dimensions: resDimensions,
      transparent: resTransparent,
      colors: resColors,
    };
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

      <form method="POST" onSubmit={handleOnSubmit}>
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
        {results && (
          <div className="m-5">
            <h2 className="text-xl mt-4">
              Material:{" "}
              {results.materials.map((material, index) => (
                <span
                  key={index}
                  className="text-sm border px-5 py-1 rounded-full"
                >
                  {material}
                </span>
              ))}
            </h2>

            <h2 className="text-xl mt-4 flex">
              Colors:{" "}
              {results.colors.map((color, index) => (
                <Fragment key={index}>
                  {color.map((cl, index) => (
                    <span
                      key={`${color}-${index}`}
                      className="inline-block w-8 h-8 rounded ml-3"
                      style={{ backgroundColor: cl }}
                    ></span>
                  ))}
                </Fragment>
              ))}
            </h2>

            <h2 className="text-xl mt-4">
              Dimensions:{" "}
              {results.dimensions.map((dimension, index) => (
                <Fragment key={index}>
                  <span className="text-sm border px-5 py-1 rounded-full">
                    Width: {dimension.predicted_width} cm
                  </span>
                  <span className="text-sm border px-5 py-1 rounded-full ml-2">
                    Height: {dimension.predicted_height} cm
                  </span>
                </Fragment>
              ))}
            </h2>

            <div className="bg-stone-800 p-4 rounded mt-10">
              <p className="p-0">Defects:</p>
              {results.defects.map((defect, index) => (
                <Image
                  key={index}
                  src={`${IMAGE_URL}/${defect}`}
                  alt="image"
                  width={400}
                  height={400}
                />
              ))}
            </div>

            <div className="bg-stone-800 p-4 rounded mt-10">
              <p className="p-0">Components:</p>
              {results.components.map((component, index) => (
                <Image
                  key={index}
                  src={`${IMAGE_URL}/${component}`}
                  alt="image"
                  width={400}
                  height={400}
                />
              ))}
            </div>

            <div className="bg-stone-800 p-2 mt-4">
              <p className="p-0">Transparent:</p>
              {results.transparent.map((transparent, index) => (
                <Image
                  key={index}
                  src={`${IMAGE_URL}/${transparent}`}
                  alt="image"
                  width={400}
                  height={400}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
