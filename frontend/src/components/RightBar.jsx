import React from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'

const RightBar = () => {
  return (
    <>
    <div className='flex flex-col  '>

      <div className="flex flex-row gap-5 m-3">

        <Link to={`/profile`}>
                 <Avatar>
                   <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe4fD5tnoKgCRVJo-CZLuiWYicy5Z3_qxXog&s" alt="post_image"
                    className="w-20 h-20 rounded-full  " />
                    <AvatarFallback>CN</AvatarFallback>
                   
                 </Avatar>
        </Link >

       <Link to={`/profile`}>
      <h1 className='text-xl mt-5 hover:text-green-700 hover:border-b-green-700 border-b-2  '>surya_pratap</h1>
      <span> plumber ,cook</span>

       </Link>



                


      </div>
      <Link to="/profile">
      <div className="text-sm text-green-700  border-green-700 italic  underline">
  complete your_profile
</div></Link>

<div className='flex flex-col mt-8 gap-3 '>

  <div className='w-full  text-xl  '>My Works</div>
  <div className='w-full  text-xl  '>Preferences</div>
  <div className='w-full  text-xl  '>Proposals</div>

</div>



     




    </div>
      
    </>
  )
}

export default RightBar
