import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Job from './Job';

const JobFeed = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/job/getjobs');
        setJobs(res.data.jobs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="p-4 w-full">
      {jobs.map((job) => (
        <Job key={job._id} job={job} />
      ))}
    </div>
  );
};

export default JobFeed;
