import React from 'react';
import { BiDislike, BiLike } from 'react-icons/bi';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { FaRegStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Job = ({ job }) => {
  return (
    <div className="flex w-full bg-gray-200 shadow-lg rounded-lg m-2 p-4">
      <div className="w-full">
        <span className="text-black text-sm font-light">
          {new Date(job.createdAt).toLocaleString()}
        </span>
        <div className="flex justify-between items-center">
          <Link to={`/jobdetail/${job._id}`} className="text-2xl hover:text-green-600  font-bold text-black">
            {job.title}
          </Link>
          <div className="flex space-x-4">
            <BiLike className="text-xl text-black" />
            <BiDislike className="text-xl text-black" />
          </div>
        </div>
        <p className="text-black mt-2">{job.description}</p>
        <div className="flex justify-between mt-4 text-black">
          <div className="flex items-center">
            {job.verified && (
              <>
                <RiVerifiedBadgeFill className="text-xl" />
                <span className="ml-1 text-sm">Verified</span>
              </>
            )}
            <div className="flex ml-4">
              {[...Array(5)].map((_, idx) => (
                <FaRegStar key={idx} className="text-yellow-400" />
              ))}
            </div>
          </div>
          <span>{job.location}</span>
          <span className="font-bold">Prize: ₹{job.prize}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {job.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`job-img-${i}`}
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Job;
