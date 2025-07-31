import React from 'react'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'

const CSignup = () => {
  return (

    <>
    
 


      
    <div className=" fixed shadow-sm w-full h-15   text-2xl text-black p-1 ">
        <span className=" max-w-full bg-yellow-600 p-1 ml-8 mt-3 rounded-lg">WORKMATE</span>
      </div>
    <div className='flex flex-col items-center justify-center w-screen h-screen'> 
   
        <form  className="shadow-sm rounded-sm text-black flex flex-col gap-5 p-8  border-1">
        <div>
            <h1 className='text-center mb-5 mt-60 text-3xl  '>Sign up to hire Worker</h1>
        </div>
        <div className='gap-3 flex flex-row'>
        <div>
            <span className='py-2 font-normal text-black '>First Name</span>
            <input type="text" name="firstname" placeholder='' className='focus:outline-none h-8 min-w-full  border-gray-700 border-1 text-xl flex p-2  rounded-sm    text-black'/>
        </div>
        <div>
            <span className=' font-normal'>Last Name</span>
            <input type="text" name="lastname" placeholder='' className='focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm hover:border-2  text-black'/>
        </div>
        </div>
        <div>
            <span className='py-2  font-normal'>Mobile Number</span>
            <input 
        type="tel" 
        name="mobilenumber"  
        placeholder='Enter your mobile number' 
        className='focus:outline-none h-8 min-w-full text-xl border-gray-700 border-1 flex pl-2 rounded-sm text-black'
        pattern="[0-9]{10}"  
        maxLength="10" 
        required  
    />
        </div>
        <div>
            <span className='py-2 font-normal'>Password</span>
            <input type="text" name="password"  placeholder='' className='focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm  text-black'/>
        </div>
        <div>
            <span className='py-2 font-normal'>Country</span>
            <select type="text" name="country"  placeholder='' className='focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm  text-black'>
          <option value="India">India</option>
          </select>
        </div>
        <div>
            <span className='py-2 font-normal'>State</span>
            <select type="text" name="state"  placeholder='' className='focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm  text-black'>
            <option value="">Select State</option>
        <option value="Andhra Pradesh">Andhra Pradesh</option>
        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
        <option value="Assam">Assam</option>
        <option value="Bihar">Bihar</option>
        <option value="Chhattisgarh">Chhattisgarh</option>
        <option value="Goa">Goa</option>
        <option value="Gujarat">Gujarat</option>
        <option value="Haryana">Haryana</option>
        <option value="Himachal Pradesh">Himachal Pradesh</option>
        <option value="Jharkhand">Jharkhand</option>
        <option value="Karnataka">Karnataka</option>
        <option value="Kerala">Kerala</option>
        <option value="Madhya Pradesh">Madhya Pradesh</option>
        <option value="Maharashtra">Maharashtra</option>
        <option value="Manipur">Manipur</option>
        <option value="Meghalaya">Meghalaya</option>
        <option value="Mizoram">Mizoram</option>
        <option value="Nagaland">Nagaland</option>
        <option value="Odisha">Odisha</option>
        <option value="Punjab">Punjab</option>
        <option value="Rajasthan">Rajasthan</option>
        <option value="Sikkim">Sikkim</option>
        <option value="Tamil Nadu">Tamil Nadu</option>
        <option value="Telangana">Telangana</option>
        <option value="Tripura">Tripura</option>
        <option value="Uttar Pradesh">Uttar Pradesh</option>
        <option value="Uttarakhand">Uttarakhand</option>
        <option value="West Bengal">West Bengal</option>
                
                </select>
        </div>
        <div>
            <span className='py-2 font-normal'>Local Address</span>
            <input type="text" name="Localaddress"  placeholder='' className='focus:outline-none h-8 min-w-full text-xl  border-gray-700 border-1 flex pl-2 rounded-sm  text-black'/>
        </div>
       <div className='gap-1 mt-4 flex '>
       <input type="chechbox" className='h-5 w-5 border-2 border-l-black hover:border-green-600 float-left' />
       <span>Send me OTP for register in workmate plateform for finding jobs.</span>
       </div>
       <Button type="submit" className="bg-green-600 max-w-full mt-8">Create my Account</Button>


<span className='text-center mt-3'>Already have an account? <Link className='text-green-800 hover:text-green-400 ' to="/login">Log in</Link></span>
        </form>

        
       


    </div>

    </>
  )
}

export default CSignup
