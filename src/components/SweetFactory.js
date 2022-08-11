import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { storageService, dbservice } from "fbase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const SweetFactory = ({ userObj }) => {
  const [sweet, setSweet] = useState("");
  const [attach, setAttach] = useState("");
  const onSubmit = async (event) => {
    if (sweet === "") {
      return;
    }
    event.preventDefault();
    let attachUrl = "";
    if (attach !== "") {
      const attachRef = storageService
        .ref()
        .child(`${userObj.uid}/${uuidv4()}`);
      const res = await attachRef.putString(attach, "data_url");
      attachUrl = await res.ref.getDownloadURL();
    }
    const sweetObj = {
      text: sweet,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      attachUrl,
    };
    await dbservice.collection("sanweets").add(sweetObj);
    setSweet("");
    setAttach("");
  };
  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setSweet(value);
  };
  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttach(result);
    };
    reader.readAsDataURL(theFile);
  };
  const onClearAttachment = () => setAttach("");
  return(
    <form onSubmit={onSubmit} className="factoryForm">
      <div className="factoryInput__container">
        <input
          className="factoryInput__input"
          value={sweet}
          onChange={onChange}
          type="text"
          placeholder="What's on your mind?"
          maxLength={120}
        />
        <input type="submit" value="&rarr;" className="factoryInput__arrow" />
      </div>
      <label htmlFor="attach-file" className="factoryInput__label">
        <span>Add photos</span>
        <FontAwesomeIcon icon={faPlus} />
      </label>
      <input
        id="attach-file"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{
          opacity: 0,
        }}
      />
      {attach && (
          <div className="factoryForm__attachment">
            <img
              src={attach}
              style={{
                backgroundImage: attach,
              }}
            />
            <div className="factoryForm__clear" onClick={onClearAttachment}>
              <span>Remove</span>
              <FontAwesomeIcon icon={faTimes} />
            </div>
        </div>
      )}
    </form>
  );
};
export default SweetFactory;
