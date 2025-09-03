import React from 'react';
import { Link } from 'react-router-dom';


function Button({link,name}) {
  return (
    <>
        <Link to={link} className="font-md border rounded-md py-1 px-3 inline-block mt-2 transition ease-in-out duration-500 border-solid border-primary text-white bg-primary hover:bg-transparent hover:text-secondary">
            {name}
        </Link>
    </>
  )
}

export default Button