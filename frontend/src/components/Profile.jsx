import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import React from 'react'
import { Button } from './ui/button'

const Profile = () => {
  return (
    <div className='flex w-full flex-col'>
      <div className='flex flex-row justify-between items-center border-2 w-full p-4'>
        {/* Left section: Avatar and user info */}
        <div className='flex flex-row m-5 items-center'>
          <Avatar>
            <AvatarImage
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe4fD5tnoKgCRVJo-CZLuiWYicy5Z3_qxXog&s"
              alt="user avatar"
              className="w-40 h-40 rounded-full"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <div className='flex flex-col ml-10'>
            <h1 className='text-3xl font-medium'>User name</h1>
            <p className='text-sm text-gray-700'>location and time</p>
          </div>
        </div>

        {/* Right section: Edit button */}
        <div>
          <Button className='bg-green-800 mr-5'>Edit Profile</Button>
        </div>
      </div>
    </div>
  )
}

export default Profile
