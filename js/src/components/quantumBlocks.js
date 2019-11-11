import React from 'react';

export const palette = [
  [
    'X', 'Y', 'Z', 'H', 'T', 'Measure', 'Rx', 'Ry', 'Rz', 'S', 'CNOT', 'Sw', 'SqRSw',
  ],

]

export const blocksJSX = {

  X: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g>
        <path fill="#a6ce38" d="M0 0h38.876v38.876H0z" className="background" style={{}} />
      </g>
      <path fill="#FFF" d="M22.795 24.784l-1.506-2.61c-.615-.998-1-1.646-1.368-2.33h-.035c-.333.69-.666 1.313-1.28 2.348l-1.417 2.6h-1.75l3.607-5.974-3.47-5.836h1.77l1.56 2.768c.437.77.77 1.367 1.084 1.997h.055c.333-.7.63-1.243 1.068-1.997l1.612-2.768h1.75l-3.592 5.746 3.68 6.06-1.767-.004z" />
    </g>
  ),
  Y: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g>
        <path fill="#a6ce38" d="M0 0h38.876v38.876H0z" className="background" style={{}} />
      </g>
      <path fill="#FFF" d="M19.115 24.784v-5.01l-3.73-6.797h1.733l1.664 3.258c.455.893.806 1.61 1.174 2.435h.035c.335-.77.737-1.542 1.19-2.435l1.7-3.258h1.735l-3.96 6.78v5.03l-1.54-.003z" />
    </g>
  ),
  Z: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g>
        <path fill="#a6ce38" d="M0 0h38.876v38.876H0z" className="background" style={{}} />
      </g>
      <path fill="#FFF" d="M15.69 23.89l6.553-9.578v-.056h-5.99v-1.28h7.97v.93l-6.516 9.546v.053h6.603v1.28h-8.618v-.894z" />
    </g>
  ),
  H: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g>
        <path id="pathSjpzud0lxgt" fill="#00bff2" d="M0 0h38.876v38.876H0z" className="background" style={{}} ></path>
      </g>
      <path fill="#FFF" d="M17.136 12.802v4.94h5.71v-4.94h1.542v11.806h-1.542v-5.534h-5.71v5.534h-1.524V12.802h1.524z" id="pathSjpzud0lxgr"></path>
    </g>
  ),
  T: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g >
        <path fill="#ff6666" d="M0 0h38.876v38.876H0z" className="background" style={{}} />
      </g>
      <path fill="#FFF" d="M19.22 14.273h-3.59v-1.296h8.74v1.296h-3.607v10.51H19.22v-10.51z"/>
    </g>
  ),
  Measure: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g >
        <path id="pathSjsbcekuvis" fill="#f070aa" d="M0 0h38.876v38.876H0V0z" style={{}}></path>
      </g>
      <g id="gSjsbcekuvii" fill="#FFF">
    		<path d="M27.083 11.544l.045.024v-.052l-.045.028zm3.234 17.466H32.6v-.002c0-3.742-1.37-7.148-3.615-9.694-1.09-1.238-2.393-2.273-3.837-3.044l-1.083 2.03c3.703 1.973 6.252 6.028 6.252 10.71zM19 17.015c1.42 0 2.777.29 4.03.8l1.087-2.036c-1.582-.675-3.305-1.05-5.115-1.05-7.513 0-13.604 6.393-13.604 14.28h2.284c0-6.615 5.077-11.996 11.318-11.995z"></path>
        <path d="M17.976 27.31l1.007.54 5.085-9.55 1.08-2.03 1.926-3.618.054-1.084-.045-.024-1.068.67-1.9 3.565-1.083 2.033-5.056 9.498z"></path>
        <path d="M27.13 11.516l-.003.053-.053 1.08-.07 1.39c-.008.158.114.29.273.3.158.007.293-.115.3-.27l.147-2.978c.008-.158-.113-.292-.27-.3-.022 0-.044.007-.062.01-.077-.024-.164-.02-.238.026l-2.57 1.604c-.13.084-.173.26-.09.393.082.133.26.174.393.09l1.125-.703 1.068-.67.05-.028v.002zM20.588 26.23c0 .877-.71 1.59-1.588 1.59-.877 0-1.588-.713-1.588-1.59s.71-1.588 1.588-1.588c.877 0 1.588.71 1.588 1.59v-.002zm8.217-11.94l1.832-2.382c.176-.218.342-.41.525-.627v-.015h-2.19v-.594h3.084l-.01.46-1.808 2.35c-.166.226-.333.426-.517.636v.017h2.367v.585H28.8l.002-.426.003-.002z"></path>
	    </g>
    </g>
  ),
  S: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g id="gSjshajn65ha">
        <path id="pathSjshajn65hb" fill="#00bff2" d="M0 0h38.876v38.876H0z" style={{}}></path>
      </g>
      <path fill="#FFF" d="M16.812 22.752c.684.42 1.682.77 2.732.77 1.56 0 2.47-.82 2.47-2.014 0-1.104-.63-1.734-2.225-2.348-1.93-.683-3.12-1.682-3.12-3.345 0-1.84 1.524-3.206 3.82-3.206 1.207 0 2.083.28 2.61.576l-.42 1.244c-.388-.21-1.176-.56-2.244-.56-1.61 0-2.225.963-2.225 1.77 0 1.103.72 1.645 2.348 2.276 1.996.77 3.012 1.734 3.012 3.468 0 1.822-1.35 3.397-4.134 3.397-1.14 0-2.383-.33-3.013-.75l.387-1.277z" id="pathSjshajn65h9"></path>
    </g>
  ),
  Rx: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g id="gSjshajn65ha">
        <path id="pathSjshajn65hb" fill="rgb(255, 202, 100)" d="M0 0h38.876v38.876H0z" style={{}}></path>
      </g>
      <text x="10" y="25" fill="#FFF" className="small">Rx</text>
    </g>
  ),
  Ry: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g id="gSjshajn65ha">
        <path id="pathSjshajn65hb" fill="rgb(255, 202, 100)" d="M0 0h38.876v38.876H0z" style={{}}></path>
      </g>
      <text x="10" y="25" fill="#FFF" className="small">Ry</text>
    </g>
  ),
  Rz: ({className, onClick,}) => (
    <g className={className} onClick={onClick}>
      <g id="gSjshajn65ha">
        <path id="pathSjshajn65hb" fill="rgb(255, 202, 100)" d="M0 0h38.876v38.876H0z" style={{}}></path>
      </g>
      <text x="10" y="25" fill="#FFF" className="small">Rz</text>
    </g>
  ),
  CNOT: ({className, onClick,}) => (

    <g  className={className} onClick={onClick}>
      <g id="gSjshajn65hh">
        <path id="pathSjshajn65hi" fill="#00bff2" d="M19.5 38.938c-10.718 0-19.437-8.73-19.437-19.47C.063 8.736 8.783 0 19.5 0c10.72 0 19.44 8.734 19.44 19.47 0 10.736-8.72 19.468-19.44 19.468z" className="background" style={{}}></path>
      </g>
      <path d="M20 11.79v15.177m-7.59-7.587h15.18" id="pathSjshajn65hf" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10"></path>
    </g>
  ),
  Sw: ({className, onClick,}) => (

    <g  className={className} onClick={onClick}>
      <g id="gSjshajn65hh">
          <path id="pathSjshajn65hi" fill="#00bff2" d="M0 0h38.876v38.876H0z" className="background" style={{}}></path>
      </g>
      <path d="M6 14 L10 14 L10 26 L14 26 L14 14 L17 14 L12 9 L7 14" id="pathSjshajn65hf" fill="rgb(255, 255, 255)" stroke="#FFF" strokeWidth="1" strokeMiterlimit="10"></path>
      <path d="M21 25 L25 25 L25 12 L29 12 L29 25 L32 25 L27 31 L22 25" id="pathSjshajn65hf" fill="rgb(255, 255, 255)" stroke="#FFF" strokeWidth="1" strokeMiterlimit="10"></path>
    </g>
  ),
  SqRSw: ({className, onClick,}) => (

    <g  className={className} onClick={onClick}>
      <g id="gSjshajn65hh">
          <path id="pathSjshajn65hi" fill="#00bff2" d="M0 0h38.876v38.876H0z" className="background" style={{}}></path>
      </g>
      <path d="M9 18 L13 18 L13 28 L17 28 L17 18 L21 18 L15 12 L9 18" id="pathSjshajn65hf" fill="rgb(255, 255, 255)" stroke="#FFF" strokeWidth="1" strokeMiterlimit="10"></path>
      <path d="M21 25 L25 25 L25 13 L29 13 L29 25 L32 25 L27 31 L22 25" id="pathSjshajn65hf" fill="rgb(255, 255, 255)" stroke="#FFF" strokeWidth="1" strokeMiterlimit="10"></path>
      <path d="M2 22 L6 30 L9 9 L30 9" id="pathSjshajn65hf" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10"></path>

    </g>
  ),

}

export const blocksConfig = {
  X: {
    hasAngle: false,
  }
}
