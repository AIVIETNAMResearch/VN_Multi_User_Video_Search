# Importing the libraries that we will use in this notebook.
import googletrans

class Translation():
    def __init__(self, from_lang='vi', to_lang='en'):
        # The class Translation is a wrapper for the two translation libraries, googletrans and translate. 
        self.__to_lang = to_lang
        self.translator = googletrans.Translator()

    def preprocessing(self, text):
        """
        It takes a string as input, and returns a string with all the letters in lowercase

        :param text: The text to be processed
        :return: The text is being returned in lowercase.
        """
        return text.lower()

    def __call__(self, text):
        """
        The function takes in a text and preprocesses it before translation

        :param text: The text to be translated
        :return: The translated text.
        """
        text = self.preprocessing(text)
        return self.translator.translate(text, dest=self.__to_lang).text