import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {type Place} from './Map';
import {useState} from 'react';
import {getCurrentUserId} from '../lib/supabaseClient';
import Chip from '@mui/material/Chip';


interface LikeProps {
  bathroom: Place;
}

/**
 * gets the # of likes for a bathroom
 * @param {number} bathroomId bathrom id
 * @returns {number} number of likes bathroom has
 */
async function getBathroomLikes(bathroomId: number) {
  // get bathrooms
  let likes = 0;

  try {
    const res = await fetch('http://localhost:3000/bathroom');
    if (res.ok) {
      const bathroomData = await res.json();

      // ensure data is of correct type
      const parsedBathroomData =
      (bathroomData as Place[]).map((bathroom) => ({
        id: bathroom.id,
        name: bathroom.name,
        position: bathroom.position,
        description: bathroom.description,
        likes: bathroom.likes,
      }));

      const bathroom =
      parsedBathroomData.find((b) => b.id === bathroomId);
      likes = bathroom?.likes ?? 0;
    }
  } catch (error) {
    console.error('Error fetching bathrooms:', error);
  }

  // get likes associated with bathroom id
  return likes;
}

/**
 * gets users liked bathrooms
 * @param {string | null} userId user id
 * @returns {Array} array of liked bathroom ids
 */
async function getLikedBathrooms(userId: string | null) {
  let bathrooms : Array<number> = [];

  try {
    const res = await fetch(`http://localhost:3000/user/likes?userId=${userId}`);
    if (res.ok) {
      bathrooms = await res.json();
    }
  } catch (error) {
    console.error('Error fetching liked bathrooms: ', error);
  }

  return bathrooms;
}

/**
 * removes the user's like from the bathroom
 * @param {number} bathroomId bathroom id
 */
async function unlikeBathroom(bathroomId: number) {
  try {
    const userId = await getCurrentUserId();
    const res = await fetch('http://localhost:3000/user/likes', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId,
        bathroomId,
      }),
    });

    if (res.ok) {
      return;
    }
  } catch (error) {
    console.error('Error deleting like: ', error);
  }

  return;
}

/**
 * adds like to the bathroom
 * @param {number} bathroomId bathroom id
 */
async function likeBathroom(bathroomId: number) {
  const userId = await getCurrentUserId();

  try {
    const res = await fetch('http://localhost:3000/user/likes', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userId,
        bathroomId,
      }),
    });

    if (res.ok) {
      return;
    }
  } catch (error) {
    console.error('Error adding like: ', error);
  }

  return;
}

const Like = ({bathroom} : LikeProps) => {
  const [liked, setLiked] = useState(false);
  const [bathroomLikes, setBathroomLikes] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * get user id from supabase and checks if user has liked the current bathroom
   * @returns {string | null} user id
   */
  async function isLiked() {
    setUserId(await getCurrentUserId());
    if (userId) {
      // get users liked bathrooms
      const likedBathrooms = await getLikedBathrooms(userId);

      setLiked(likedBathrooms.includes(bathroom.id));
    }
  }

  isLiked();

  const handleToggle = async () => {
    // update likes table
    if (liked) {
      await unlikeBathroom(bathroom.id);
      await isLiked();
    } else {
      await likeBathroom(bathroom.id);
      await isLiked();
    }

    // get likes for bathroom and set number of likes
    setBathroomLikes(await getBathroomLikes(bathroom.id));
  };

  return (
    <div onClick = {handleToggle}>
      {/* if not liked, favorite border icon, else favorite */}
      {liked ? <FavoriteIcon/> : <FavoriteBorderIcon/>}
      {bathroomLikes}
      {bathroomLikes >= 5 ?
        <Chip label="Verified Bathroom" variant="outlined" /> : null}
    </div>
  );
};

export default Like;
