import Image from "next/image";
import Link from "next/link";
import React from "react";

const CompanyShow = () => {
  return (
    <div className="flex flex-col gap-8">
         <section class="bg-white dark:bg-gray-900 mx-8 flex flex-col md:flex-row gap-8 justify-center items-center">
      <Link
        href="#"
        class="flex flex-col items-center bg-[#E6E6E7] border border-gray-300 rounded-full shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 px-4"
      >
        <Image
          src="/main-page/inv-image.svg"
          class=" rounded-t-lg rounded-l-3xl  md:rounded-l-full md:rounded-s-lg bg-#1066A8"
          alt="inv-image"
          width={200}
          height={200}
        />
        <div class="flex flex-col justify-between p-4 leading-normal">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Advanced Inventory Managment
          </h5>
          <p class="mb-3 font-normal text-[#172554] dark:text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so
            far, in reverse chronological order.
          </p>
        </div>
      </Link>
      <Link
        href="#"
        class="flex flex-col items-center bg-[#E6E6E7] border border-gray-300 rounded-full shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 px-4"
      >
        <Image
          src="/main-page/flit-image.svg"
          class=" rounded-t-lg rounded-l-3xl  md:rounded-l-full md:rounded-s-lg bg-#1066A8"
          alt="inv-image"
          width={200}
          height={200}
        />
        <div class="flex flex-col justify-between p-4 leading-normal">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Flight Managment System & Spare Parts Managment
          </h5>
          <p class="mb-3 font-normal text-[#172554] dark:text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so
            far, in reverse chronological order.
          </p>
        </div>
      </Link>
    </section>
         <section class="bg-white dark:bg-gray-900 mx-8 flex flex-col md:flex-row gap-8 justify-center items-center">
      <Link
        href="#"
        class="flex flex-col items-center bg-[#E6E6E7] border border-gray-300 rounded-full shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 px-4"
      >
        <Image
          src="/main-page/flit-image.svg"
          class=" rounded-t-lg rounded-l-3xl  md:rounded-l-full md:rounded-s-lg bg-#1066A8"
          alt="inv-image"
          width={200}
          height={200}
        />
        <div class="flex flex-col justify-between p-4 leading-normal">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
           Engaging Website For Your Business
          </h5>
          <p class="mb-3 font-normal text-[#172554] dark:text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so
            far, in reverse chronological order.
          </p>
        </div>
      </Link>
      <Link
        href="#"
        class="flex flex-col items-center bg-[#E6E6E7] border border-gray-300 rounded-full shadow-md md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 px-4"
      >
        <Image
          src="/main-page/inv-image.svg"
          class=" rounded-t-lg rounded-l-3xl  md:rounded-l-full md:rounded-s-lg bg-#1066A8"
          alt="inv-image"
          width={200}
          height={200}
        />
        <div class="flex flex-col justify-between p-4 leading-normal">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Noteworthy technology acquisitions 2021
          </h5>
          <p class="mb-3 font-normal text-[#172554] dark:text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so
            far, in reverse chronological order.
          </p>
        </div>
      </Link>
    </section>
    </div>
 
  );
};

export default CompanyShow;
