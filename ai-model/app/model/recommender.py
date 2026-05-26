jewelry_recommendations = {
    "oval": {
        "earrings": ["drop", "chandelier", "hoops"],
        "glasses": ["cat_eye", "aviator", "round"],
        "nose_ring": ["simple_stud", "hoop"],
        "headpiece": ["tiara", "crown"]
    },
    "round": {
        "earrings": ["chandelier", "drop", "linear"],
        "glasses": ["rectangular", "square", "cat_eye"],
        "nose_ring": ["simple_stud", "hoop"],
        "headpiece": ["tiara"]
    },
    "square": {
        "earrings": ["hoops", "chandelier", "drop"],
        "glasses": ["round", "oval", "adventurous"],
        "nose_ring": ["hoop", "stud"],
        "headpiece": ["crown"]
    },
    "heart": {
        "earrings": ["stud", "drop", "shoulder_duster"],
        "glasses": ["round", "bottom_heavy"],
        "nose_ring": ["stud", "thin_hoop"],
        "headpiece": ["delicate_crown"]
    },
    "diamond": {
        "earrings": ["stud", "hoop", "drop"],
        "glasses": ["oval", "cat_eye"],
        "nose_ring": ["stud"],
        "headpiece": ["tiara"]
    },
    "oblong": {
        "earrings": ["stud", "chandelier", "shoulder_duster"],
        "glasses": ["cat_eye", "clubmaster"],
        "nose_ring": ["hoop", "stud"],
        "headpiece": ["headband", "crown"]
    }
}

def get_recommendations(face_shape):
    """Get jewelry recommendations for a face shape"""
    if face_shape not in jewelry_recommendations:
        return None
    
    return jewelry_recommendations[face_shape]

def recommend_jewelry(face_shape, jewelry_type):
    """Get specific jewelry recommendations for face shape and type"""
    recs = get_recommendations(face_shape)
    
    if not recs or jewelry_type not in recs:
        return []
    
    return recs[jewelry_type]
