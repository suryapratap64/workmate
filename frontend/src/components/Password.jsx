import React from 'react'
import { Button } from './ui/button'
import { RiLockPasswordFill } from "react-icons/ri";
const Password = () => {
  return (
    <>
      <div className="  m-5  ml-8 text-2xl text-black p-1 ">
        <span className="  bg-yellow-600 p-1 rounded-lg">WORKMATE</span>
      </div>
     <form action="submit" className='flex flex-col items-center  justify-center'>
      <h1 className='text-3xl font-semibold mt-30 '>Welcome</h1>
      <div >
            <span className='flex justify-center text-xl mt-3 font-normal '>Mobile Number</span>
            <div className="flex border-2 mt-8 rounded-2xl border-gray-700 flex-row  ">
            <RiLockPasswordFill className='h-5 w-5 mt-2 ml-4' />



            <input type="text" name="password"  placeholder='Password' className='focus:outline-none h-10 w-90 text-xl flex pl-5  text-black'/>
            </div>
            
         
        </div>

        <div className='mt-4 gap-10 flex '>
     
      <div className='gap-2 flex'><input type="chechbox" checked="" className='h-5 w-5 border-2 border-black hover:border-green-600 float-left ' />
       <span className='flex float-left' >Keep me logged in
       </span>
       </div>
     
       <span className='text-green-600  '>Forgot password?</span>
       </div>

       <Button type="submit" className="  w-100 justify-center text-xl h-12 bg-green-600 hover:bg-green-700 mt-8 max-w-full">
Log in
       </Button>
       <span className='text-red-600 mt-6'>not you?</span>

     </form>
      
      
      
    </>
  )
}

export default Password
