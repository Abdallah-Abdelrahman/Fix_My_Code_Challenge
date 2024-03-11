#!/usr/bin/python3
'''square class'''


class Square():
    '''Define square
    Attrs:
        width: width of square
        height: height of square
    '''

    width = 0
    height = 0

    def __init__(self, *args, **kwargs):
        '''Initiliaze the instance'''
        for key, value in kwargs.items():
            setattr(self, key, value)

    def area_of_my_square(self):
        """ Area of the square """
        return self.width * self.width

    def permiter_of_my_square(self):
        '''Calculatte the permiter'''
        return (self.width * 2) + (self.width * 2)

    def __str__(self):
        '''human-friendly representation of the instance'''
        return "{}/{}".format(self.width, self.height)


if __name__ == "__main__":

    s = Square(width=12, height=9)
    print(s)
    print(s.area_of_my_square())
    print(s.permiter_of_my_square())
