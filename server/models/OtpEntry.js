import sql from "../db.js";

export async function findOrCreateOtp(contact, otp, otpExpires) {
  const result = await sql`
    INSERT INTO otp_entries (contact, otp, otp_expires_at)
    VALUES (${contact}, ${otp}, ${otpExpires})
    ON CONFLICT (contact) 
    DO UPDATE SET otp = EXCLUDED.otp, otp_expires_at = EXCLUDED.otp_expires_at, is_verified = FALSE
    RETURNING *
  `;
  return result[0];
}

// Finds an OTP entry by contact
export async function findOtpByContact(contact) {
  const result = await sql`
    SELECT * FROM otp_entries WHERE contact = ${contact}
  `;
  return result[0];
}

// Marks an OTP as verified
export async function verifyOtp(contact) {
  const result = await sql`
    UPDATE otp_entries SET is_verified = TRUE WHERE contact = ${contact} RETURNING *
  `;
  return result[0];
}

// Deletes an OTP entry
export async function deleteOtp(contact) {
  await sql`
    DELETE FROM otp_entries WHERE contact = ${contact}
  `;
}

{
  /* auth*/
}
{
  /*
  otp = 
  endpoint  = http://localhost:3000/auth/otp
  
  payload =  {
    "contact": "3333333333"
              }
    
    */
}
{
  /*
  otp-verify = 
  endpoint  = http://localhost:3000/auth/otp-verify/:number

  payload =  {
    "otp": "3333"
              }
    */
}
{
  /*
  register = 
  endpoint  = http://localhost:3000/auth/register

  payload =  {
    "name": "three",
    "email": "three@gmail.com",
    "password": "333333",
    "contact": "3333333333",
    "alternativeContact": "9123456789",
    "typeofOccupation": "Software Engineer",
    "address": "64cfea457db1d274afbeef99",
    "roll": "64cfed127db1d274afbeefaa",
    "plant": "64cfed507db1d274afbeefbb",
    "profileImage": {
        "url": "https://via.placeholder.com/150",
        "key": "user/johndoe-profile.jpg"
    }
}
    */
}
{
  /*
  login = 
  endpoint  = http://localhost:3000/auth/login

  payload =  {
    "identifier": "three@gmail.com",
    "password": "333333"
}
    */
}

{
  /* user*/
}
{
  /*
  getallusers = 
  endpoint  = http://localhost:3000/api/allusers

    */
}
{
  /*
  getuserbyid = 
  endpoint  = http://localhost:3000/api/user/:id
    */
}
{
  /*
  my info = 
  endpoint  = http://localhost:3000/api/user/me
    */
}
{
  /*
  activestatus = 
  endpoint  =http://localhost:3000/api/user/68919c826fa50c38b14fad51/status

  payload =  {
    "isActive": true
              }
    */
}

{
  /* plant*/
}
{
  /*
  getallplants = 
  endpoint  = http://localhost:3000/api/getallplants
    */
}
{
  /*
  getplantById = 
  endpoint  = http://localhost:3000/api/plant/:plantId
    */
}
{
  /*
  deleteplantById = 
  endpoint  = http://localhost:3000/api/plant/:plantId
    */
}
{
  /*
  link plant = 
  endpoint  = http://localhost:3000/api/user/link-plant
  payload = {"plantId":"6892fd7bfe821bad3f7c12a8"}
  authtoken
    */
}
{
  /*
  updateplantById = 
  endpoint  = http://localhost:3000/api/plant/:plantId
  payload = {
  "name": " Production Plant",
  "status": true,
  "address": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "statecode": "MH",
    "countrycode": "IN",
    "pincode": 400001
  }
}
    */
}

{
  /* role*/
}
{
  /*
  getallroless = 
  endpoint  = http://localhost:3000/api/getallroles
    */
}
{
  /*
  getcreate role = 
  endpoint  = http://localhost:3000/api/roles
    */
}
